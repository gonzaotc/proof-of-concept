import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, fourAddress, fiveAddress, sixAddress, sevenAddress } = await hre.getNamedAccounts();

  /* Compute the salt using the deployer address as the first 20 bytes */
  console.log("Upgrade Deployer: ", deployer);
  const deployerBytes = ethers.getBytes(deployer);
  const padding = ethers.getBytes("0x000000000000000000000000"); // 12 bytes of padding to make 32 bytes
  const salt = ethers.concat([deployerBytes, padding]);

  /* Get the deployed immutable create-2 factory */
  const factoryDeployment = await hre.deployments.get("ImmutableCreate2Factory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("ImmutableCreate2Factory", factoryAddress);
  console.log("Using immutable factory at", factoryAddress);

  /* Get the deployed ProxyAdmin */
  const proxyAdminDeployment = await hre.deployments.get("ProxyAdmin");
  const proxyAdminAddress = proxyAdminDeployment.address;
  const proxyAdmin = await ethers.getContractAt("ProxyAdmin", proxyAdminAddress);
  console.log("Using proxy admin at", proxyAdminAddress);

  /* Get the deployed TransparentUpgradeableProxy */
  const proxyDeployment = await hre.deployments.get("TransparentUpgradeableProxy");
  const proxyAddress = proxyDeployment.address;
  console.log("Using proxy at", proxyAddress);

  /* Deploy the UpgradeableForwarder V2 using the factory */
  const upgradeableForwarderV2Factory = await ethers.getContractFactory("UpgradeableForwarderV2");
  const upgradeableForwarderV2DeployTransaction = await upgradeableForwarderV2Factory.getDeployTransaction([
    fourAddress,
    fiveAddress,
    sixAddress,
    sevenAddress,
  ]);
  const upgradeableForwarderV2Bytecode = upgradeableForwarderV2DeployTransaction.data;
  const upgradeableForwarderV2Address = await factory.findCreate2Address(salt, upgradeableForwarderV2Bytecode);
  const upgradeableForwarderV2Tx = await factory.safeCreate2(salt, upgradeableForwarderV2Bytecode, { from: deployer });
  await upgradeableForwarderV2Tx.wait();
  console.log(`UpgradeableForwarder V2 deployed at: ${upgradeableForwarderV2Address}`);
  await hre.deployments.save("UpgradeableForwarderV2", {
    address: upgradeableForwarderV2Address,
    ...(await hre.deployments.getExtendedArtifact("UpgradeableForwarderV2")),
  });

  /* Check that Proxy works on implementation v1 */
  const proxy = await ethers.getContractAt("UpgradeableForwarder", proxyAddress);
  /* Get the first Forwarder target via the TransparentUpgradeableProxy */
  const target1 = await proxy.getTarget(0);
  console.log("Forwarder target1: ", target1);
  const target2 = await proxy.getTarget(1);
  console.log("Forwarder target3: ", target2);
  const target3 = await proxy.getTarget(2);
  console.log("Forwarder target2: ", target3);

  /* Upgrade the TransparentUpgradeableProxy */
  const upgradeTx = await proxyAdmin.upgradeAndCall(proxyAddress, upgradeableForwarderV2Address, "0x");
  await upgradeTx.wait();
  console.log("Proxy upgraded");

  /* Check that Proxy works on implementation v2 */
  const proxyV2 = await ethers.getContractAt("UpgradeableForwarderV2", proxyAddress);
  /* Get the first Forwarder target via the TransparentUpgradeableProxy */
  const target1V2 = await proxyV2.getTarget(0);
  console.log("Forwarder target1: ", target1V2);
  const target2V2 = await proxyV2.getTarget(1);
  console.log("Forwarder target2: ", target2V2);
  const target3V2 = await proxyV2.getTarget(2);
  console.log("Forwarder target3: ", target3V2);
  const target4V2 = await proxyV2.getTarget(3);
  console.log("Forwarder target4: ", target4V2);
};

export default func;
func.tags = ["Upgrade-low-level"];
func.dependencies = ["Proxies-low-level"];
