import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { deployer, fourAddress, fiveAddress, sixAddress, sevenAddress } =
    await getNamedAccounts();

  const proxyAdmin = await deployments.get("ProxyAdmin");
  const transparentProxy = await deployments.get("TransparentUpgradeableProxy");

  const newImplementation = await deploy("UpgradeableForwarderV2", {
    from: deployer,
    args: [[fourAddress, fiveAddress, sixAddress, sevenAddress]], // Add the new target address
    log: true,
  });

  await execute(
    "ProxyAdmin",
    { from: deployer, log: true },
    "upgrade",
    transparentProxy.address,
    newImplementation.address,
  );
};

export default func;
func.tags = ["Upgrade-high-level"];
func.dependencies = ["Proxies-high-level"];
