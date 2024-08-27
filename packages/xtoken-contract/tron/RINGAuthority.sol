pragma solidity ^0.4.23;

contract RINGAuthority {
    mapping(address => bool) public allowList;

    constructor(address[] memory _allowlists) {
        for (uint256 i = 0; i < _allowlists.length; i++) {
            allowList[_allowlists[i]] = true;
        }
    }

    function canCall(address _src, address, bytes4 _sig)
        public
        view
        returns (bool)
    {
        return (
            allowList[_src]
                && _sig == bytes4(keccak256("mint(address,uint256)"))
        )
            || (
                allowList[_src]
                    && _sig == bytes4(keccak256("burn(address,uint256)"))
            );
    }
}
