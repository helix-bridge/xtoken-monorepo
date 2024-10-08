// SPDX-License-Identifier: MIT

/**
 *  ___   ___ .___________.  ______    __  ___  _______ .__   __. 
 * \  \ /  / |           | /  __  \  |  |/  / |   ____||  \ |  | 
 *  \  V  /  `---|  |----`|  |  |  | |  '  /  |  |__   |   \|  | 
 *   >   <       |  |     |  |  |  | |    <   |   __|  |  . `  | 
 *  /  .        |  |     |  `--'  | |  .  \  |  |____ |  |\   | 
 * /__/ \__\     |__|      \______/  |__|\__\ |_______||__| \__| 
 *                                                                
 *
 * 8/12/2024
 **/

pragma solidity ^0.8.17;

// File contracts/interfaces/IXTokenBacking.sol
// License-Identifier: MIT

interface IXTokenBacking {
    function lockAndXIssue(
        uint256 remoteChainId,
        address originalToken,
        address recipient,
        address rollbackAccount,
        uint256 amount,
        uint256 nonce,
        bytes calldata extData,
        bytes memory extParams
    ) external payable returns(bytes32 transferId);

    function unlock(
        uint256 remoteChainId,
        address originalToken,
        address sender,
        address recipient,
        address rollbackAccount,
        uint256 amount,
        uint256 nonce,
        bytes calldata extData
    ) external;

    function rollbackLockAndXIssue(
        uint256 remoteChainId,
        address originalToken,
        address sender,
        address recipient,
        address rollbackAccount,
        uint256 amount,
        uint256 nonce
    ) external;

    function guard() external returns(address);
}

// File @helix/contracts/helix-contract/contracts/utils/AccessController.sol@v1.0.0
// License-Identifier: MIT

/// @title AccessController
/// @notice AccessController is a contract to control the access permission 
/// @dev See https://github.com/helix-bridge/contracts/tree/master/helix-contract
contract AccessController {
    address public dao;
    address public operator;
    address public pendingDao;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyDao() {
        require(msg.sender == dao, "!dao");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "!operator");
        _;
    }

    function _initialize(address _dao) internal {
        dao = _dao;
        operator = _dao;
    }

    function setOperator(address _operator) onlyDao external {
        operator = _operator;
    }

    function transferOwnership(address _dao) onlyDao external {
        pendingDao = _dao;
    }

    function acceptOwnership() external {
        address oldDao = dao;
        address newDao = msg.sender;
        require(pendingDao == newDao, "!pendingDao");
        delete pendingDao;
        dao = newDao;
        emit OwnershipTransferred(oldDao, newDao);
    }
}

// File @helix/contracts/helix-contract/contracts/utils/DailyLimit.sol@v1.0.0
// License-Identifier: MIT


/// @title relay with daily limit - Allows the relay to mint token in a daily limit.
contract DailyLimit {

    event DailyLimitChange(address token, uint dailyLimit);

    mapping(address => uint) public dailyLimit;
    // deprecated, slot for upgrade
    mapping(address => uint) public _slotReserved;
    mapping(address => uint) public spentToday;

    uint constant public SPEND_BIT_LENGTH = 192;
    uint constant public LASTDAY_BIT_LENGTH = 64;

    /// ==== Internal functions ==== 

    /// @dev Contract constructor sets initial owners, required number of confirmations and daily mint limit.
    /// @param _token Token address.
    /// @param _dailyLimit Amount in wei, which can be mint without confirmations on a daily basis.
    function _setDailyLimit(address _token, uint _dailyLimit)
        internal
    {
        require(_dailyLimit < type(uint192).max, "DaliyLimit: overflow uint192");
        dailyLimit[_token] = _dailyLimit;
    }

    /// @dev Allows to change the daily limit.
    /// @param _token Token address.
    /// @param _dailyLimit Amount in wei.
    function _changeDailyLimit(address _token, uint _dailyLimit)
        internal
    {
        require(_dailyLimit < type(uint192).max, "DaliyLimit: overflow uint192");
        dailyLimit[_token] = _dailyLimit;
        emit DailyLimitChange(_token, _dailyLimit);
    }

    /// @dev Allows to change the daily limit.
    /// @param token Token address.
    /// @param amount Amount in wei.
    function expendDailyLimit(address token, uint amount)
        internal
    {
        uint spentInfo = spentToday[token];
        uint lastday = spentInfo >> SPEND_BIT_LENGTH;
        uint lastspent = spentInfo << LASTDAY_BIT_LENGTH >> LASTDAY_BIT_LENGTH;
        if (block.timestamp > lastday + 24 hours) {
            require(amount <= dailyLimit[token], "DailyLimit: amount exceed daily limit");
            spentToday[token] = (block.timestamp << SPEND_BIT_LENGTH) + amount;
            return;
        }
        require(lastspent + amount <= dailyLimit[token] && amount <= dailyLimit[token], "DailyLimit: exceed daily limit");
        spentToday[token] = spentInfo + amount;
    }

    /// ==== Web3 call functions ==== 

    /// @dev Returns maximum withdraw amount.
    /// @param token Token address.
    /// @return Returns amount.
    function calcMaxWithdraw(address token)
        public
        view
        returns (uint)
    {
        uint spentInfo = spentToday[token];
        uint lastday = spentInfo >> SPEND_BIT_LENGTH;
        uint lastspent = spentInfo << LASTDAY_BIT_LENGTH >> LASTDAY_BIT_LENGTH;
        if (block.timestamp > lastday + 24 hours) {
          return dailyLimit[token];
        }

        if (dailyLimit[token] < lastspent) {
          return 0;
        }

        return dailyLimit[token] - lastspent;
    }
}

// File @helix/contracts/helix-contract/contracts/messagers/interface/IMessager.sol@v1.0.0
// License-Identifier: MIT

interface ILowLevelMessageSender {
    function registerRemoteReceiver(uint256 remoteChainId, address remoteBridge) external;
    function sendMessage(uint256 remoteChainId, bytes memory message, bytes memory params) external payable;
}

interface ILowLevelMessageReceiver {
    function registerRemoteSender(uint256 remoteChainId, address remoteBridge) external;
    function recvMessage(address remoteSender, address localReceiver, bytes memory payload) external;
}

// File @zeppelin-solidity/contracts/utils/Address.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (utils/Address.sol)


/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File @zeppelin-solidity/contracts/proxy/utils/Initializable.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (proxy/utils/Initializable.sol)


/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
    /**
     * @dev Indicates that the contract has been initialized.
     * @custom:oz-retyped-from bool
     */
    uint8 private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Triggered when the contract has been initialized or reinitialized.
     */
    event Initialized(uint8 version);

    /**
     * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
     * `onlyInitializing` functions can be used to initialize parent contracts. Equivalent to `reinitializer(1)`.
     */
    modifier initializer() {
        bool isTopLevelCall = !_initializing;
        require(
            (isTopLevelCall && _initialized < 1) || (!Address.isContract(address(this)) && _initialized == 1),
            "Initializable: contract is already initialized"
        );
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
     * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
     * used to initialize parent contracts.
     *
     * `initializer` is equivalent to `reinitializer(1)`, so a reinitializer may be used after the original
     * initialization step. This is essential to configure modules that are added through upgrades and that require
     * initialization.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     */
    modifier reinitializer(uint8 version) {
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     */
    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");
        if (_initialized < type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }
}

// File @zeppelin-solidity/contracts/token/ERC20/IERC20.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)


/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// File @helix/contracts/helix-contract/contracts/utils/TokenTransferHelper.sol@v1.0.0
// License-Identifier: MIT

library TokenTransferHelper {
    function safeTransfer(
        address token,
        address receiver,
        uint256 amount
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(
            IERC20.transfer.selector,
            receiver,
            amount
        ));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "helix:transfer token failed");
    }

    function safeTransferFrom(
        address token,
        address sender,
        address receiver,
        uint256 amount
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(
            IERC20.transferFrom.selector,
            sender,
            receiver,
            amount
        ));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "helix:transferFrom token failed");
    }

    function safeTransferNative(
        address receiver,
        uint256 amount
    ) internal {
        (bool success,) = payable(receiver).call{value: amount}("");
        require(success, "helix:transfer native token failed");
    }

    function tryTransferNative(
        address receiver,
        uint256 amount
    ) internal returns(bool) {
        (bool success,) = payable(receiver).call{value: amount}("");
        return success;
    }
}

// File @zeppelin-solidity/contracts/utils/Context.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)


/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File @zeppelin-solidity/contracts/security/Pausable.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (security/Pausable.sol)


/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

// File contracts/base/XTokenBridgeBase.sol
// License-Identifier: MIT






// The Base contract for xToken protocol
// Backing or Issuing contract will inherit the contract.
// This contract define the access authorization, the message channel
contract XTokenBridgeBase is Initializable, Pausable, AccessController, DailyLimit {
    uint256 constant public TRANSFER_UNFILLED = 0x00;
    uint256 constant public TRANSFER_DELIVERED = 0x01;
    uint256 constant public TRANSFER_REFUNDED = 0x02;
    struct MessagerService {
        address sendService;
        address receiveService;
    }

    struct RequestInfo {
        bool isRequested;
        bool hasRefundForFailed;
    }

    // the version is to issue different xTokens for different version of bridge.
    string public version;
    address public guard;
    // remoteChainId => info
    mapping(uint256 => MessagerService) public messagers;

    // transferId => RequestInfo
    mapping(bytes32 => RequestInfo) public requestInfos;

    // transferId => result
    // 1. 0x01: filled by receive message
    // 2. 0x02: filled by refund operation
    mapping(bytes32 => uint256) public filledTransfers;

    // must be called by message service configured
    modifier calledByMessager(uint256 _remoteChainId) {
        address receiveService = messagers[_remoteChainId].receiveService;
        require(receiveService == msg.sender, "invalid messager");
        _;
    }

    function initialize(address _dao, string calldata _version) public initializer {
        _initialize(_dao);
        version = _version;
    }

    function unpause() external onlyOperator {
        _unpause();
    }

    function pause() external onlyOperator {
        _pause();
    }

    function setSendService(uint256 _remoteChainId, address _remoteBridge, address _service) external onlyDao {
        require(_service != address(0), "invalid service address");
        messagers[_remoteChainId].sendService = _service;
        ILowLevelMessageSender(_service).registerRemoteReceiver(_remoteChainId, _remoteBridge);
    }

    function setReceiveService(uint256 _remoteChainId, address _remoteBridge, address _service) external onlyDao {
        require(_service != address(0), "invalid service address");
        messagers[_remoteChainId].receiveService = _service;
        ILowLevelMessageReceiver(_service).registerRemoteSender(_remoteChainId, _remoteBridge);
    }

    function _sendMessage(
        uint256 _remoteChainId,
        bytes memory _payload,
        uint256 _feePrepaid,
        bytes memory _extParams
    ) internal whenNotPaused {
        MessagerService memory service = messagers[_remoteChainId];
        require(service.sendService != address(0), "bridge not configured");
        ILowLevelMessageSender(service.sendService).sendMessage{value: _feePrepaid}(
            _remoteChainId,
            _payload,
            _extParams
        );
    }

    // request a cross-chain transfer
    // 1. lock and remote issue
    // 2. burn and remote unlock
    // save the transferId if not exist, else revert
    function _requestTransfer(bytes32 _transferId) internal {
        require(requestInfos[_transferId].isRequested == false, "this request already exists");
        requestInfos[_transferId].isRequested = true;
    }

    // receive a cross-chain refund request
    // 1. request must be exist
    // 2. can't repeat
    function _handleRefund(bytes32 _transferId) internal {
        RequestInfo memory requestInfo = requestInfos[_transferId];
        require(requestInfo.isRequested, "this request does not exist");
        require(requestInfo.hasRefundForFailed == false, "this request has already been refunded");
        requestInfos[_transferId].hasRefundForFailed = true;
    }

    // receive a cross-chain request
    // must not filled
    // fill the transfer with delivered transfer type
    function _handleTransfer(bytes32 _transferId) internal {
        require(filledTransfers[_transferId] == TRANSFER_UNFILLED, "!conflict");
        filledTransfers[_transferId] = TRANSFER_DELIVERED;
    }

    // request a cross-chain refund
    // 1. can retry
    // 2. can't be filled by delivery
    function _requestRefund(bytes32 _transferId) internal {
        uint256 filledTransfer = filledTransfers[_transferId];
        // already fill by refund, retry request
        if (filledTransfer == TRANSFER_REFUNDED) {
            return;
        }
        require(filledTransfer == TRANSFER_UNFILLED, "!conflict");
        filledTransfers[_transferId] = TRANSFER_REFUNDED;
    }

    function getTransferId(
        uint256 _nonce,
        uint256 _sourceChainId,
        uint256 _targetChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount
    ) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_nonce, _sourceChainId, _targetChainId, _originalToken, _sender, _recipient, _rollbackAccount, _amount));
    }

    // settings
    function updateGuard(address _guard) external onlyDao {
        guard = _guard;
    }

    function setDailyLimit(address _token, uint256 _dailyLimit) external onlyDao {
        _setDailyLimit(_token, _dailyLimit);
    }
}

// File contracts/interfaces/IXToken.sol
// License-Identifier: MIT

interface IXToken {
    function transferOwnership(address newOwner) external;
    function acceptOwnership() external;
    function mint(address account, uint256 amount) external;
    function burn(address account, uint256 amount) external;
    function approve(address spender, uint256 value) external returns (bool);
}

// File contracts/interfaces/IXTokenCallback.sol
// License-Identifier: MIT

interface IXTokenCallback {
    function xTokenCallback(
        uint256 transferId,
        address xToken,
        uint256 amount,
        bytes calldata extData
    ) external;
}

interface IXTokenRollbackCallback {
    function xTokenRollbackCallback(
        uint256 transferId,
        address token,
        uint256 amount
    ) external;
}

// File @zeppelin-solidity/contracts/utils/introspection/IERC165.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)


/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File @zeppelin-solidity/contracts/utils/introspection/ERC165Checker.sol@v4.7.3
// License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.2) (utils/introspection/ERC165Checker.sol)


/**
 * @dev Library used to query support of an interface declared via {IERC165}.
 *
 * Note that these functions return the actual result of the query: they do not
 * `revert` if an interface is not supported. It is up to the caller to decide
 * what to do in these cases.
 */
library ERC165Checker {
    // As per the EIP-165 spec, no interface should ever match 0xffffffff
    bytes4 private constant _INTERFACE_ID_INVALID = 0xffffffff;

    /**
     * @dev Returns true if `account` supports the {IERC165} interface,
     */
    function supportsERC165(address account) internal view returns (bool) {
        // Any contract that implements ERC165 must explicitly indicate support of
        // InterfaceId_ERC165 and explicitly indicate non-support of InterfaceId_Invalid
        return
            _supportsERC165Interface(account, type(IERC165).interfaceId) &&
            !_supportsERC165Interface(account, _INTERFACE_ID_INVALID);
    }

    /**
     * @dev Returns true if `account` supports the interface defined by
     * `interfaceId`. Support for {IERC165} itself is queried automatically.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsInterface(address account, bytes4 interfaceId) internal view returns (bool) {
        // query support of both ERC165 as per the spec and support of _interfaceId
        return supportsERC165(account) && _supportsERC165Interface(account, interfaceId);
    }

    /**
     * @dev Returns a boolean array where each value corresponds to the
     * interfaces passed in and whether they're supported or not. This allows
     * you to batch check interfaces for a contract where your expectation
     * is that some interfaces may not be supported.
     *
     * See {IERC165-supportsInterface}.
     *
     * _Available since v3.4._
     */
    function getSupportedInterfaces(address account, bytes4[] memory interfaceIds)
        internal
        view
        returns (bool[] memory)
    {
        // an array of booleans corresponding to interfaceIds and whether they're supported or not
        bool[] memory interfaceIdsSupported = new bool[](interfaceIds.length);

        // query support of ERC165 itself
        if (supportsERC165(account)) {
            // query support of each interface in interfaceIds
            for (uint256 i = 0; i < interfaceIds.length; i++) {
                interfaceIdsSupported[i] = _supportsERC165Interface(account, interfaceIds[i]);
            }
        }

        return interfaceIdsSupported;
    }

    /**
     * @dev Returns true if `account` supports all the interfaces defined in
     * `interfaceIds`. Support for {IERC165} itself is queried automatically.
     *
     * Batch-querying can lead to gas savings by skipping repeated checks for
     * {IERC165} support.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsAllInterfaces(address account, bytes4[] memory interfaceIds) internal view returns (bool) {
        // query support of ERC165 itself
        if (!supportsERC165(account)) {
            return false;
        }

        // query support of each interface in _interfaceIds
        for (uint256 i = 0; i < interfaceIds.length; i++) {
            if (!_supportsERC165Interface(account, interfaceIds[i])) {
                return false;
            }
        }

        // all interfaces supported
        return true;
    }

    /**
     * @notice Query if a contract implements an interface, does not check ERC165 support
     * @param account The address of the contract to query for support of an interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @return true if the contract at account indicates support of the interface with
     * identifier interfaceId, false otherwise
     * @dev Assumes that account contains a contract that supports ERC165, otherwise
     * the behavior of this method is undefined. This precondition can be checked
     * with {supportsERC165}.
     * Interface identification is specified in ERC-165.
     */
    function _supportsERC165Interface(address account, bytes4 interfaceId) private view returns (bool) {
        // prepare call
        bytes memory encodedParams = abi.encodeWithSelector(IERC165.supportsInterface.selector, interfaceId);

        // perform static call
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly {
            success := staticcall(30000, account, add(encodedParams, 0x20), mload(encodedParams), 0x00, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0x00)
        }

        return success && returnSize >= 0x20 && returnValue > 0;
    }
}

// File contracts/base/XTokenIssuing.sol
// License-Identifier: MIT






contract XTokenIssuing is XTokenBridgeBase {
    struct OriginalTokenInfo {
        uint256 chainId;
        address token;
    }

    // original Token => xToken mapping is saved in Issuing Contract
    // salt => xToken address
    mapping(bytes32 => address) public xTokens;
    // xToken => Origin Token Info
    mapping(address => OriginalTokenInfo) public originalTokens;

    event IssuingERC20Updated(uint256 originalChainId, address originalToken, address xToken, address oldxToken);
    event RollbackLockAndXIssueRequested(bytes32 transferId, address originalToken, address originalSender, uint256 amount, uint256 fee);
    event xTokenIssued(bytes32 transferId, uint256 remoteChainId, address originalToken, address xToken, address recipient, uint256 amount);
    event BurnAndXUnlocked(
        bytes32 transferId,
        uint256 nonce,
        uint256 remoteChainId,
        address sender,
        address recipient,
        address originalToken,
        uint256 amount,
        uint256 fee,
        bytes   extData
    );
    event TokenRemintForFailed(bytes32 transferId, uint256 originalChainId, address originalToken, address xToken, address originalSender, uint256 amount);

    // using this interface, the Issuing contract must be must be granted mint and burn authorities.
    // warning: if the _xToken contract has no transferOwnership/acceptOwnership interface, then the authority cannot be transfered.
    function updateXToken(
        uint256 _originalChainId,
        address _originalToken,
        address _xToken
    ) external onlyDao {
        bytes32 salt = xTokenSalt(_originalChainId, _originalToken);
        address oldxToken = xTokens[salt];
        if (oldxToken != address(0)) {
            delete originalTokens[oldxToken];
        }
        xTokens[salt] = _xToken;
        originalTokens[_xToken] = OriginalTokenInfo(_originalChainId, _originalToken);
        require(IXToken(_xToken).approve(address(this), type(uint256).max), "approve xtoken failed");
        emit IssuingERC20Updated(_originalChainId, _originalToken, _xToken, oldxToken);
    }

    // transfer xToken ownership
    function transferXTokenOwnership(address _xToken, address _newOwner) external onlyDao {
        IXToken(_xToken).transferOwnership(_newOwner);
    }

    function acceptXTokenOwnership(address _xToken) external onlyDao {
        IXToken(_xToken).acceptOwnership();
    }

    // receive issuing xToken message from remote backing contract
    function issue(
        uint256 _remoteChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData
    ) external calledByMessager(_remoteChainId) whenNotPaused {
        bytes32 transferId = getTransferId(_nonce, _remoteChainId, block.chainid, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        bytes32 salt = xTokenSalt(_remoteChainId, _originalToken);
        address xToken = xTokens[salt];
        require(xToken != address(0), "xToken not exist");
        require(_amount > 0, "can not receive amount zero");
        expendDailyLimit(xToken, _amount);

        _handleTransfer(transferId);

        {
          address _guard = guard;

          if (_guard != address(0)) {
              require(_recipient == _guard, "must issue token from guard");
          }
        }
        IXToken(xToken).mint(_recipient, _amount);

        if (ERC165Checker.supportsInterface(_recipient, type(IXTokenCallback).interfaceId)) {
            IXTokenCallback(_recipient).xTokenCallback(uint256(transferId), xToken, _amount, _extData);
        }

        emit xTokenIssued(transferId, _remoteChainId, _originalToken, xToken, _recipient, _amount);
    }

    function burnAndXUnlock(
        address _xToken,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData,
        bytes memory _extParams
    ) external payable returns(bytes32 transferId) {
        require(_amount > 0, "can not transfer amount zero");
        require(_recipient != address(0), "invalid recipient");
        require(_rollbackAccount != address(0), "invalid rollbackAccount");
        OriginalTokenInfo memory originalInfo = originalTokens[_xToken];
        transferId = getTransferId(_nonce, originalInfo.chainId, block.chainid, originalInfo.token, msg.sender, _recipient, _rollbackAccount, _amount);
        _requestTransfer(transferId);
        // transfer to this and then burn
        TokenTransferHelper.safeTransferFrom(_xToken, msg.sender, address(this), _amount);
        IXToken(_xToken).burn(address(this), _amount);

        bytes memory remoteUnlockCall = encodeXUnlock(
            originalInfo.token,
            msg.sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce,
            _extData
        );
        _sendMessage(originalInfo.chainId, remoteUnlockCall, msg.value, _extParams);
        emit BurnAndXUnlocked(transferId, _nonce, originalInfo.chainId, msg.sender, _recipient, originalInfo.token, _amount, msg.value, _extData);
    }

    function encodeXUnlock(
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _extData
    ) public view returns(bytes memory) {
        return abi.encodeWithSelector(
            IXTokenBacking.unlock.selector,
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

    // send unlock message when issuing failed
    // 1. message has been delivered
    // 2. xtoken not issued
    // this method can retry
    function xRollbackLockAndXIssue(
        uint256 _originalChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce,
        bytes memory _extParams
    ) external payable {
        require(_rollbackAccount == msg.sender || dao == msg.sender, "invalid msgSender");
        bytes32 transferId = getTransferId(_nonce, _originalChainId, block.chainid, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        _requestRefund(transferId);
        bytes memory handleUnlockForFailed = encodeRollbackLockAndXIssue(
            _originalToken,
            _sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce
        );
        _sendMessage(_originalChainId, handleUnlockForFailed, msg.value, _extParams);
        emit RollbackLockAndXIssueRequested(transferId, _originalToken, _sender, _amount, msg.value);
    }

    function encodeRollbackLockAndXIssue(
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce
    ) public view returns(bytes memory) {
        return abi.encodeWithSelector(
            IXTokenBacking.rollbackLockAndXIssue.selector,
            block.chainid,
            _originalToken,
            _sender,
            _recipient,
            _rollbackAccount,
            _amount,
            _nonce
        );
    }

    // when burn and unlock failed
    // receive reIssue(refund) message from remote backing contract
    // this will refund xToken to original sender
    // 1. the transfer not refund before
    // 2. the burn information(hash) matched
    function rollbackBurnAndXUnlock(
        uint256 _originalChainId,
        address _originalToken,
        address _sender,
        address _recipient,
        address _rollbackAccount,
        uint256 _amount,
        uint256 _nonce
    ) external calledByMessager(_originalChainId) whenNotPaused {
        bytes32 transferId = getTransferId(_nonce, _originalChainId, block.chainid, _originalToken, _sender, _recipient, _rollbackAccount, _amount);
        _handleRefund(transferId);

        bytes32 salt = xTokenSalt(_originalChainId, _originalToken);
        address xToken = xTokens[salt];
        require(xToken != address(0), "xToken not exist");

        IXToken(xToken).mint(_sender, _amount);
        if (ERC165Checker.supportsInterface(_sender, type(IXTokenRollbackCallback).interfaceId)) {
            IXTokenRollbackCallback(_sender).xTokenRollbackCallback(uint256(transferId), xToken, _amount);
        }
        emit TokenRemintForFailed(transferId, _originalChainId, _originalToken, xToken, _sender, _amount);
    }

    function xTokenSalt(
        uint256 _originalChainId,
        address _originalToken
    ) public view returns(bytes32) {
        return keccak256(abi.encodePacked(_originalChainId, _originalToken, version));
    }
}
