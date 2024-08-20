import { HardhatUserConfig } from "hardhat/config";
import baseConfig from "../hardhat.base.config";
import path from "path";
/* Adding hardhat-deploy on this particular project */
import "hardhat-deploy";
import "hardhat-deploy-ethers";

export const DETERMINISTIC_DEPLOYMENT_SALT = "0x11111";

const config: HardhatUserConfig = {
  ...baseConfig,
  paths: {
    root: path.join(__dirname),
    sources: path.join(__dirname, "contracts"),
    tests: path.join(__dirname, "tests"),
    cache: path.join(__dirname, "cache"),
    artifacts: path.join(__dirname, "artifacts"),
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    zeroAddress: {
      default: "0x0000000000000000000000000000000000000000",
    },
    oneAddress: {
      default: "0x0000000000000000000000000000000000000001",
    },
    twoAddress: {
      default: "0x0000000000000000000000000000000000000002",
    },
    threeAddress: {
      default: "0x0000000000000000000000000000000000000003",
    },
    fourAddress: {
      default: "0x0000000000000000000000000000000000000004",
    },
    fiveAddress: {
      default: "0x0000000000000000000000000000000000000005",
    },
    sixAddress: {
      default: "0x0000000000000000000000000000000000000006",
    },
    sevenAddress: {
      default: "0x0000000000000000000000000000000000000007",
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      saveDeployments: true,
    },
    localhost: { saveDeployments: true },
    // mainnet: {
    //   url: process.env.MAINNET_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
    // rinkeby: {
    //   url: process.env.RINKEBY_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  solidity: {
    compilers: [
      {
        version: "0.5.6",
        settings: {},
      },
      {
        version: "0.8.20",
        settings: {},
      },
      {
        version: "0.8.26",
        settings: {},
      },
    ],
  },
  // Optionally, you can override other configurations here
  //   solidity: "0.8.17", // Different version for this POC
};

export default config;
