import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, oneAddress, twoAddress, threeAddress } = await getNamedAccounts();

  /* Deploy ProxyAdmin with deterministic deployment */
  const proxyAdmin = await deploy("ProxyAdmin", {
    from: deployer,
    log: true,
    deterministicDeployment: true,
  });
  /* Deploy UpgradeableForwarder implementation with deterministic deployment */
  const upgradeableForwarderImpl = await deploy("UpgradeableForwarder", {
    from: deployer,
    args: [[oneAddress, twoAddress, threeAddress]],
    log: true,
    deterministicDeployment: true,
  });

  /* Deploy TransparentUpgradeableProxy using deterministic deployment */
  const transparentUpgradeableProxy = await deploy("TransparentUpgradeableProxy", {
    from: deployer,
    args: [upgradeableForwarderImpl.address, proxyAdmin.address, "0x"],
    log: true,
    deterministicDeployment: true,
  });

  /* Initialize the proxy */
  const proxy = await ethers.getContractAt(
    "UpgradeableForwarder",
    transparentUpgradeableProxy.address
  );

  await proxy.__Proxy_init(deployer);
};

export default func;
func.tags = ["Proxies-high-level"];
func.dependencies = ["ImmutableCreate2Factory-high-level"];
