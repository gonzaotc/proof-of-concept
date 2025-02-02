import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ImmutableCreate2Factory", {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = ["ImmutableCreate2Factory-high-level"];
