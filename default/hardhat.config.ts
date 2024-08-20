import { HardhatUserConfig } from "hardhat/config";
import baseConfig from "../hardhat.base.config";
import path from "path";

const config: HardhatUserConfig = {
  ...baseConfig,
  paths: {
    root: path.join(__dirname),
    sources: path.join(__dirname, "contracts"),
    tests: path.join(__dirname, "tests"),
    cache: path.join(__dirname, "cache"),
    artifacts: path.join(__dirname, "artifacts"),
  },
  // Optionally, you can override other configurations here
  //   solidity: "0.8.17", // Different version for this POC
};

export default config;
