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
  return setStorageAt(
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

    await setTokens(WETH_ADDRESS, WETH_SLOT, contractAddress, '4000000')
    await setTokens(DAI_ADDRESS, DAI_SLOT, contractAddress, '30000000')
  })

  it('balanceOfToken: should return balance of WETH', async function () {
    expect(await balancer.balanceOfToken(WETH_ADDRESS)).to.equal(
      '4000000000000000000000000'
    )
  })
  it('balanceOfToken: should return balance of DAI', async function () {
    expect(await balancer.balanceOfToken(DAI_ADDRESS)).to.equal(
      '30000000000000000000000000'
    )
  })
  it('swapTwoTokens: should return incremented WETH and reduced DAI balance after swap DAI for WETH', async function () {
    await balancer.swapTwoTokens(
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      DAI_ADDRESS,
      WETH_ADDRESS,
      '1000000000000',
      '1'
    )
    balancer
      .balanceOfToken(DAI_ADDRESS)
      .then((balance) =>
        expect(+balance).to.be.lessThan('30000000000000000000000000')
      )
    balancer
      .balanceOfToken(WETH_ADDRESS)
      .then((balance) =>
        expect(+balance).to.be.greaterThan('4000000000000000000000000')
      )
  })
  it('getId: should return poolId', async function () {
    expect(await balancer.getId('0x32296969ef14eb0c6d29669c550d4a0449130230')).to.equal(
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080'
    )
  })
  it('getTokens: should return pool tokens', async function () {
    const tokens = await balancer.getTokens('0x32296969ef14eb0c6d29669c550d4a0449130230')
    expect(tokens[0][0]).to.equal(
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'
    )
    expect(tokens[0][1]).to.equal(
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    )
  })
})
