const { expect } = require('chai')
const { ethers } = require('hardhat')

const setTokens = async (token, slot, address, balance) => {
  const setStorageAt = async (address, index, value) => {
    await ethers.provider.send('hardhat_setStorageAt', [address, index, value])
    await ethers.provider.send('evm_mine', []) // Just mines to the next block
  }

  const toBytes32 = (bn) => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32))
  }

  const locallyManipulatedBalance = ethers.utils.parseUnits(balance)
  // Get storage slot index
  const index = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [address, slot] // key, slot
  )
  // Manipulate local balance (needs to be bytes32 string)
  await setStorageAt(
    token,
    index.toString(),
    toBytes32(locallyManipulatedBalance).toString()
  )
}

describe('Balancer', function () {
  let Balancer
  let balancer

  // tokens
  const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const WETH_SLOT = 3
  const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
  const DAI_SLOT = 2

  beforeEach(async function () {
    Balancer = await hre.ethers.getContractFactory('Balancer')
    balancer = await Balancer.deploy()
    const contractAddress = balancer.address

    setTokens(WETH_ADDRESS, WETH_SLOT, contractAddress, '4000000')
    setTokens(DAI_ADDRESS, DAI_SLOT, contractAddress, '30000000')
  })

  it('Should return balance of WETH', async function () {
    expect(await balancer.balanceWeth()).to.equal('4000000000000000000000000')
  })
  it('Should return DAI balance', async function () {
    expect(await balancer.balanceDai()).to.equal('30000000000000000000000000')
  })

  it('Should return reduced WETH and incremented DAI balance after swap WETH for DAI', async function () {
    await balancer.swapWethForDai(
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      '1000000000000',
      '1'
    )
    balancer
      .balanceWeth()
      .then((balance) =>
        expect(+balance).to.be.lessThan('4000000000000000000000000')
      )
    balancer
      .balanceDai()
      .then((balance) =>
        expect(+balance).to.be.greaterThan('30000000000000000000000000')
      )
  })
  it('Should return incremented WETH and reduced DAI balance after swap DAI for WETH', async function () {
    await balancer.swapDaiForWeth(
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      '1000000000000',
      '1'
    )
    balancer
      .balanceDai()
      .then((balance) =>
        expect(+balance).to.be.lessThan('30000000000000000000000000')
      )
    balancer
      .balanceWeth()
      .then((balance) =>
        expect(+balance).to.be.greaterThan('4000000000000000000000000')
      )
  })
})
