// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@zeppelin-solidity/contracts/utils/introspection/ERC165Checker.sol";
import "@helix/contracts/helix-contract/contracts/utils/TokenTransferHelper.sol";
import "./XTokenBridgeBase.sol";
import "../interfaces/IXTokenIssuing.sol";
import "../interfaces/IXTokenCallback.sol";

// The contract implements the backing side of the Helix xToken protocol. 
// When sending cross-chain transactions, the user locks the Token in the contract, and when the message reaches the target chain, the corresponding mapped asset (xToken) will be issued;
// if the target chain fails to issue the xToken, the user can send a reverse message on the target chain to unlock the original asset.
contract XTokenBacking is XTokenBridgeBase {
    // save original token => bool to prevent unregistered token lock
    mapping(bytes32 => bool) public registeredTokens;

    event TokenLocked(
        bytes32 transferId,
        uint256 nonce,
        uint256 remoteChainId,
        address token,
        address sender,
        address recipient,
        address rollbackAccount,
        uint256 amount,
        uint256 fee,
        bytes   extData
    );
    event TokenUnlocked(bytes32 transferId, uint256 remoteChainId, address token, address recipient, uint256 amount);
    event RemoteIssuingFailure(bytes32 transferId, address xToken, address originalSender, uint256 amount, uint256 fee);
    event TokenUnlockedForFailed(bytes32 transferId, uint256 remoteChainId, address token, address recipient, uint256 amount);

    // register token on source chain
    // this is used to prevent the unregistered token's transfer
    // and must be registered on the target chain before
    function registerOriginalToken(
        uint256 _remoteChainId,
        address _originalToken,
        uint256 _dailyLimit
    ) external onlyDao {
        bytes32 key = keccak256(abi.encodePacked(_remoteChainId, _originalToken));
        registeredTokens[key] = true;
        _setDailyLimit(_originalToken, _dailyLimit);
    }

    // We use nonce to ensure that messages are not duplicated
    // especially in reorg scenarios, the destination chain use nonce to filter out duplicate deliveries. 
    // nonce is user-defined, there is no requirement that it must not be repeated.
    // But the transferId generated must not be repeated.
    // msg.value is the fee pay for message
    function lockAndXIssue(
        uint256 _remoteChainId,
        address _originalToken,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData,
        bytes memory _extParams
    ) external payable returns(bytes32 transferId) {
        bytes32 key = keccak256(abi.encodePacked(_remoteChainId, _originalToken));
        require(registeredTokens[key], "token not registered");
        require(_amount > 0, "invalid transfer amount");
        require(_recipient != address(0), "invalid recipient");
        require(_rollbackAccount != address(0), "invalid rollbackAccount");

        transferId = getTransferId(_nonce, block.chainid, _remoteChainId, _originalToken, msg.sender, _recipient, _rollbackAccount, _amount);
        _requestTransfer(transferId);

        // erc20 token
        TokenTransferHelper.safeTransferFrom(
            _originalToken,
            msg.sender,
            address(this),
            _amount
        );
        bytes memory issueXToken = encodeXIssue(
            _originalToken,
            msg.sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce,
            _extData
        );
        _sendMessage(_remoteChainId, issueXToken, msg.value, _extParams);
        emit TokenLocked(transferId, _nonce, _remoteChainId, _originalToken, msg.sender, _recipient, _rollbackAccount, _amount, msg.value, _extData);
    }

    function encodeXIssue(
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData
    ) internal view returns(bytes memory) {
        return abi.encodeWithSelector(
            IXTokenIssuing.issue.selector,
            block.chainid,
            _originalToken,
            _sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce,
            _extData
        );
    }

    // receive unlock original token message from remote issuing contract
    function unlock(
        uint256 _remoteChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData
    ) external calledByMessager(_remoteChainId) whenNotPaused {
        expendDailyLimit(_originalToken, _amount);

        bytes32 transferId = getTransferId(_nonce, block.chainid, _remoteChainId, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        _handleTransfer(transferId);

        address _guard = guard;
        if (_guard != address(0)) {
            require(_recipient == _guard, "must unlock token from guard");
        }
        TokenTransferHelper.safeTransfer(_originalToken, _recipient, _amount);

        if (ERC165Checker.supportsInterface(_recipient, type(IXTokenCallback).interfaceId)) {
            IXTokenCallback(_recipient).xTokenCallback(uint256(transferId), _originalToken, _amount, _extData);
        }

        emit TokenUnlocked(transferId, _remoteChainId, _originalToken, _recipient, _amount);
    }

    // send message to Issuing when unlock failed
    function xRollbackBurnAndXUnlock(
        uint256 _remoteChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes memory _extParams
    ) external payable {
        require(_rollbackAccount == msg.sender || dao == msg.sender, "invalid msgSender");
        bytes32 transferId = getTransferId(_nonce, block.chainid, _remoteChainId, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        _requestRefund(transferId);
        bytes memory unlockForFailed = encodeRollbackBurnAndXUnlock(
            _originalToken,
            _sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce
        );
        _sendMessage(_remoteChainId, unlockForFailed, msg.value, _extParams);
        emit RemoteIssuingFailure(transferId, _originalToken, _sender, _amount, msg.value);
    }

    function encodeRollbackBurnAndXUnlock(
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce
    ) public view returns(bytes memory) {
        return abi.encodeWithSelector(
            IXTokenIssuing.rollbackBurnAndXUnlock.selector,
            block.chainid,
            _originalToken,
            _sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce
        );
    }

    // when lock and issuing failed
    // receive unlock(refund) message from remote issuing contract
    // this will refund original token to original sender
    // 1. the message is not refunded before
    // 2. the locked message exist and the information(hash) matched
    function rollbackLockAndXIssue(
        uint256 _remoteChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce
    ) external calledByMessager(_remoteChainId) whenNotPaused {
        bytes32 transferId = getTransferId(_nonce, block.chainid, _remoteChainId, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        _handleRefund(transferId);
        TokenTransferHelper.safeTransfer(_originalToken, _sender, _amount);

        if (ERC165Checker.supportsInterface(_sender, type(IXTokenRollbackCallback).interfaceId)) {
            IXTokenRollbackCallback(_sender).xTokenRollbackCallback(uint256(transferId), _originalToken, _amount);
        }
        emit TokenUnlockedForFailed(transferId, _remoteChainId, _originalToken, _sender, _amount);
    }
}
 
