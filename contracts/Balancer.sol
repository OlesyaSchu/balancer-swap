// SPDX-License-Identifier: GPL-3.0

pragma solidity >0.7.0;
pragma experimental ABIEncoderV2;

import "@balancer-labs/v2-vault/contracts/interfaces/IVault.sol";
import "@balancer-labs/v2-vault/contracts/interfaces/IBasePool.sol";

contract Balancer {
    IVault private vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    function balanceOfToken(address _address) public view returns (uint) {
        IERC20 token = IERC20(_address);
        return token.balanceOf(address(this));
    }

    function swapTwoTokens(bytes32 _poolId, address _addressIn, address _addressOut, uint256 _amount, uint256 _limit) public {
        require(_amount >= 1000000000000, 'The amount must be greater or equal than 1000000000000');
        IERC20 token = IERC20(_addressIn);
        token.approve(address(vault), _amount);
        IVault.SingleSwap memory singleSwap = IVault.SingleSwap({
            poolId: _poolId,
            kind: IVault.SwapKind.GIVEN_IN,
            assetIn: IAsset(_addressIn),
            assetOut: IAsset(_addressOut),
            amount: _amount, // > 1000000000000
            userData: ''
        });
        IVault.FundManagement memory fundManagement = IVault.FundManagement({
            sender: address(this),
            fromInternalBalance: false,
            recipient: payable(address(this)),
            toInternalBalance: false
        });
        vault.swap(singleSwap, fundManagement, _limit, block.timestamp);
    }

    function getId(address _id) public view returns (bytes32) {
        IBasePool pool = IBasePool(_id);
        return pool.getPoolId();
    }

    function getTokens(address _id) public view returns (IERC20[] memory tokens, uint256[] memory balances, uint256 lastChangeBlock) {
        bytes32 poolId = getId(_id);
        return vault.getPoolTokens(poolId);
    }
}
