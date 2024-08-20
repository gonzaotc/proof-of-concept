import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, oneAddress, twoAddress, threeAddress } = await hre.getNamedAccounts();

  /* Compute the salt using the deployer address as the first 20 bytes */
  console.log("Proxies Deployer: ", deployer);
  const deployerBytes = ethers.getBytes(deployer);
  const padding = ethers.getBytes("0x000000000000000000000000"); // 12 bytes of padding to make 32 bytes
  const salt = ethers.concat([deployerBytes, padding]);

  /* Get the deployed immutable create-2 factory */
  const factoryDeployment = await hre.deployments.get("ImmutableCreate2Factory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("ImmutableCreate2Factory", factoryAddress);
  console.log("Using immutable factory at", factoryAddress);

  /* Deploy the ProxyAdmin using the factory */
  const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
  const proxyAdminDeployTransaction = await proxyAdminFactory.getDeployTransaction(deployer);
  const proxyAdminBytecode = proxyAdminDeployTransaction.data;
  const proxyAdminAddress = await factory.findCreate2Address(salt, proxyAdminBytecode);
  const proxyAdminTx = await factory.safeCreate2(salt, proxyAdminBytecode, { from: deployer });
  await proxyAdminTx.wait();
  console.log(`ProxyAdmin deployed at: ${proxyAdminAddress}`);
  await hre.deployments.save("ProxyAdmin", {
    address: proxyAdminAddress,
    ...(await hre.deployments.getExtendedArtifact("ProxyAdmin")),
  });

  /* Deploy the UpgradeableForwarder using the factory */
  const upgradeableForwarderFactory = await ethers.getContractFactory("UpgradeableForwarder");
  const upgradeableForwarderDeployTransaction = await upgradeableForwarderFactory.getDeployTransaction([oneAddress, twoAddress, threeAddress]);
  const upgradeableForwarderBytecode = upgradeableForwarderDeployTransaction.data;
  const upgradeableForwarderAddress = await factory.findCreate2Address(salt, upgradeableForwarderBytecode);
  const upgradeableForwarderTx = await factory.safeCreate2(salt, upgradeableForwarderBytecode, { from: deployer });
  await upgradeableForwarderTx.wait();
  console.log(`UpgradeableForwarder V1 deployed at: ${upgradeableForwarderAddress}`);
  await hre.deployments.save("UpgradeableForwarder", {
    address: upgradeableForwarderAddress,
    ...(await hre.deployments.getExtendedArtifact("UpgradeableForwarder")),
  });

  /* Deploy the TransparentUpgradeableProxy using the factory */
  const transparentProxyFactory = await ethers.getContractFactory("TransparentUpgradeableProxy");
  const transparentProxyDeployTransaction = await transparentProxyFactory.getDeployTransaction(upgradeableForwarderAddress, proxyAdminAddress, "0x");
  const transparentProxyBytecode = transparentProxyDeployTransaction.data;
  const transparentProxyAddress = await factory.findCreate2Address(salt, transparentProxyBytecode);
  const transparentProxyTx = await factory.safeCreate2(salt, transparentProxyBytecode, { from: deployer });
  await transparentProxyTx.wait();
  console.log(`TransparentUpgradeableProxy deployed at: ${transparentProxyAddress}`);
  await hre.deployments.save("TransparentUpgradeableProxy", {
    address: transparentProxyAddress,
    ...(await hre.deployments.getExtendedArtifact("TransparentUpgradeableProxy")),
  });

  /* Initialize the TransparentUpgradeableProxy */
  const proxy = await ethers.getContractAt("UpgradeableForwarder", transparentProxyAddress);
  await proxy.__Proxy_init(deployer);
  console.log("Proxy initialized");

  /* Check that Proxy works */
  /* Get the first Forwarder target via the TransparentUpgradeableProxy */
  const target1 = await proxy.getTarget(0);
  console.log("Forwarder target1: ", target1);
  const target2 = await proxy.getTarget(1);
  console.log("Forwarder target3: ", target2);
  const target3 = await proxy.getTarget(2);
  console.log("Forwarder target2: ", target3);
};

export default func;
func.tags = ["Proxies-low-level"];
func.dependencies = ["ImmutableCreate2Factory-low-level"];
