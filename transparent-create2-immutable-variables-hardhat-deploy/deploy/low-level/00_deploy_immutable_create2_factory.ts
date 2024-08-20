import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("ImmutableFactory Deployer: ", deployer);

  await deploy("ImmutableCreate2Factory", {
    from: deployer,
    log: true,
  });
  const factoryDeployment = await deployments.get("ImmutableCreate2Factory");
  const factoryAddress = factoryDeployment.address;
  console.log("ImmutableCreate2Factory deployed at", factoryAddress);
};

export default func;
func.tags = ["ImmutableCreate2Factory-low-level"];
