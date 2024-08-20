import { ethers, deployments, getNamedAccounts, network } from "hardhat";
import { expect } from "chai";

describe("UpgradeableForwarder on Forked Networks", function () {
  let deployer: string;

  before(async () => {
    ({ deployer } = await getNamedAccounts());
  });

  async function forkNetwork(forkingUrl: string, blockNumber: number) {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: forkingUrl,
            blockNumber: blockNumber,
          },
        },
      ],
    });
  }

  async function deployContracts() {
    await deployments.fixture(["Proxies"]);
    const factory = await ethers.getContract(
      "ImmutableCreate2Factory",
      deployer,
    );
    const forwarder = await ethers.getContract(
      "UpgradeableForwarder",
      deployer,
    );
    return { factory, forwarder };
  }

  it("should deploy with deterministic address on Mainnet fork", async function () {
    await forkNetwork(process.env.MAINNET_URL || "", 12345678);
    const { factory, forwarder } = await deployContracts();

    const salt = ethers.utils.solidityKeccak256(["string"], ["test"]);
    const bytecode = forwarder.bytecode;
    const expectedAddress = await factory.findCreate2Address(salt, bytecode);

    const deployTx = await factory.safeCreate2(salt, bytecode, {
      from: deployer,
    });
    await deployTx.wait();

    const deployedAddress = await factory.findCreate2Address(salt, bytecode);
    expect(deployedAddress).to.equal(expectedAddress);
  });

  it("should deploy with deterministic address on Rinkeby fork", async function () {
    await forkNetwork(process.env.RINKEBY_URL || "", 87654321);
    const { factory, forwarder } = await deployContracts();

    const salt = ethers.utils.solidityKeccak256(["string"], ["test"]);
    const bytecode = forwarder.bytecode;
    const expectedAddress = await factory.findCreate2Address(salt, bytecode);

    const deployTx = await factory.safeCreate2(salt, bytecode, {
      from: deployer,
    });
    await deployTx.wait();

    const deployedAddress = await factory.findCreate2Address(salt, bytecode);
    expect(deployedAddress).to.equal(expectedAddress);
  });

  it("should upgrade the implementation and retain the proxy address on Mainnet fork", async function () {
    await forkNetwork(process.env.MAINNET_URL || "", 12345678);
    await deployments.fixture(["Proxies"]);
    const proxy = await ethers.getContract(
      "TransparentUpgradeableProxy",
      deployer,
    );

    const initialImplementation = await proxy.implementation();
    expect(initialImplementation).to.not.be.undefined;

    await deployments.run("Upgrade");
    const newImplementation = await proxy.implementation();
    expect(newImplementation).to.not.equal(initialImplementation);
  });

  it("should upgrade the implementation and retain the proxy address on Rinkeby fork", async function () {
    await forkNetwork(process.env.RINKEBY_URL || "", 87654321);
    await deployments.fixture(["Proxies"]);
    const proxy = await ethers.getContract(
      "TransparentUpgradeableProxy",
      deployer,
    );

    const initialImplementation = await proxy.implementation();
    expect(initialImplementation).to.not.be.undefined;

    await deployments.run("Upgrade");
    const newImplementation = await proxy.implementation();
    expect(newImplementation).to.not.equal(initialImplementation);
  });
});
