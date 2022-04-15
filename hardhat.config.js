require('@nomiclabs/hardhat-waffle')
require('dotenv').config()
require('hardhat-gas-reporter')

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1,
      accounts: [
        {
          privateKey: process.env.PRIVATE_KEY1,
          balance: '10000000000000000000000',
        },
        {
          privateKey: process.env.PRIVATE_KEY2,
          balance: '10000000000000000000000',
        },
      ],
      forking: {
        url: process.env.URL, // tg home
      },
    },
    frame: {
      url: 'http://localhost:1248',
    },
  },
}
