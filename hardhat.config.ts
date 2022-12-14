// require("@nomiclabs/hardhat-waffle");
import "@nomicfoundation/hardhat-chai-matchers";
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
import "@openzeppelin/hardhat-upgrades";
require('@nomicfoundation/hardhat-toolbox');

import { task } from "hardhat/config";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    hardhat: {},


    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/1lo5rOEtPbYlohlrOYiNa9xTUc2Qm8uD`,
      accounts: ['4fc7459f2cbdf22e0456f3e6fb980903bdcfa52ce068defba7bc73978069847a'],
      chainId: 80001,
      blockConfirmations: 6,
      // gas: 100000000000,
      // gasPrice: 100000000000,
      // blockGasLimit: 8000000,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: "2ZVVD7T3GP2KAFVMXHD5KES3RN67WI6456"
  }
};
