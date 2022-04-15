// SPDX-License-Identifier: GPL-3.0

pragma solidity >0.7.0;
pragma experimental ABIEncoderV2;

import "@balancer-labs/v2-vault/contracts/interfaces/IVault.sol";
import "@balancer-labs/v2-vault/contracts/interfaces/IBasePool.sol";

contract Balancer {
    IVault private vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);
    // IBasePool private constant bPool = IBasePool(0xBA12222222228d8Ba445958a75a0704d566BF2C8);
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    IERC20 private daiToken = IERC20(DAI);
    IERC20 private wethToken = IERC20(WETH);

    function balanceDai() public view returns (uint) {
        return daiToken.balanceOf(address(this));
    }

    function balanceWeth() public view returns (uint) {
        return wethToken.balanceOf(address(this));
    }

    function swapWethForDai(bytes32 _poolId, uint256 _amount, uint256 _limit) public {
        // daiToken.approve(address(vault), type(uint).max);
        require(_amount >= 1000000000000, 'The amount must be greater or equal than 1000000000000');
        wethToken.approve(address(vault), _amount);
        IVault.SingleSwap memory singleSwap = IVault.SingleSwap({
            poolId: _poolId,
            kind: IVault.SwapKind.GIVEN_IN,
            assetIn: IAsset(WETH), // send weth
            assetOut: IAsset(DAI), // get dai
            amount: _amount, // > 1000000000000
            userData: ''
        });
        swap(singleSwap, _limit);
    }

    function swapDaiForWeth(bytes32 _poolId, uint256 _amount, uint256 _limit) public {
        require(_amount >= 1000000000000, 'The amount must be greater or equal than 1000000000000');
        daiToken.approve(address(vault), _amount);
        IVault.SingleSwap memory singleSwap = IVault.SingleSwap({
            poolId: _poolId,
            kind: IVault.SwapKind.GIVEN_IN,
            assetIn: IAsset(DAI), // send dai
            assetOut: IAsset(WETH), // get weth
            amount: _amount, // > 1000000000000
            userData: ''
        });
        swap(singleSwap, _limit);
    }

    function swap(IVault.SingleSwap memory _singleSwap, uint256 _limit) public {
        IVault.FundManagement memory fundManagement = IVault.FundManagement({
            sender: address(this),
            fromInternalBalance: false,
            recipient: payable(address(this)),
            toInternalBalance: false
        });
        vault.swap(_singleSwap, fundManagement, _limit, block.timestamp);
    }
}
