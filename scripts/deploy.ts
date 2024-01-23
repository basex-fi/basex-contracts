import { ethers, upgrades } from "hardhat";
import { ZeroAddress } from "ethers";
import hre from "hardhat";

const UNISWAP_V3_FACTORY_ADDRESS = "0xdeb5da25276F0e9776044b5a7f45Fd692B1dAF8B";
// const UNISWAP_V3_FACTORY_ADDRESS = "0x7721FFcbf6af0bd43FCE74B8C450cEeBfDCe8DE3";
const GAMMA_FEE_RECEIPIENT = "0xfbE533Ac756f65E783B00df7B860755959B51880";

async function main() {
  console.log("Deploying contracts...");

  // BXT
  const BXT = await ethers.deployContract("BaseXToken");
  await BXT.waitForDeployment();
  console.log(`BXT deployed. Address: ${BXT.target}`);
  await verifyContract(BXT.target, []);

  // veArtProxy
  const veArtProxy = await ethers.deployContract("VeArtProxyUpgradeable");
  await veArtProxy.waitForDeployment();
  await verifyContract(veArtProxy.target, []);

  // veBXT / VotingEscrow
  let input = [BXT.target, veArtProxy.target];
  const veBXT = await ethers.deployContract("VotingEscrow", input);
  await veBXT.waitForDeployment();
  console.log(`veBXT deployed. Address: ${veBXT.target}`);
  await verifyContract(veBXT.target, input);

  // RewardsDistributor
  input = [veBXT.target];
  const rewardsDistributor = await ethers.deployContract(
    "RewardsDistributor",
    input
  );
  await rewardsDistributor.waitForDeployment();
  console.log(
    `rewardsDistributor deployed. Address: ${rewardsDistributor.target}`
  );
  await verifyContract(rewardsDistributor.target, input);

  // PERMISSIONS REGISTRY
  const permissionsRegistry = await ethers.deployContract(
    "PermissionsRegistry"
  );
  await permissionsRegistry.waitForDeployment();
  console.log(
    `Permissions Registry deployed. Address: ${permissionsRegistry.target}`
  );
  await verifyContract(permissionsRegistry.target, []);

  // BRIBE FACTORY
  input = [
    ZeroAddress,
    permissionsRegistry.target,
    [] as any, // default reward tokens //TODO
  ];
  const bribeFactoryV3Contract = await ethers.getContractFactory(
    "BribeFactoryV3"
  );
  const bribeFactoryV3 = await upgrades.deployProxy(
    bribeFactoryV3Contract,
    input,
    {
      initializer: "initialize",
    }
  );
  await bribeFactoryV3.waitForDeployment();
  console.log(`BribeFactoryV3 deployed. Address: ${bribeFactoryV3.target}`);
  await verifyContract(bribeFactoryV3.target, []);

  // GAUGE FACTORY V2 CL
  input = [permissionsRegistry.target, GAMMA_FEE_RECEIPIENT];
  const gaugeFactoryV2CLContract = await ethers.getContractFactory(
    "GaugeFactoryV2_CL"
  );
  const gaugeFactoryV2CL = await upgrades.deployProxy(
    gaugeFactoryV2CLContract,
    input,
    {
      initializer: "initialize",
    }
  );
  await gaugeFactoryV2CL.waitForDeployment();
  console.log(`GaugeFactoryV2CL deployed. Address: ${gaugeFactoryV2CL.target}`);
  await verifyContract(gaugeFactoryV2CL.target, []);

  // Voter V3
  input = [
    veBXT.target,
    UNISWAP_V3_FACTORY_ADDRESS,
    gaugeFactoryV2CL.target,
    bribeFactoryV3.target,
  ];
  const voterV3Contract = await ethers.getContractFactory("VoterV3");
  const voterV3 = await upgrades.deployProxy(voterV3Contract, input, {
    initializer: "initialize",
  });
  await voterV3.waitForDeployment();
  console.log(`VoterV3 deployed. Address: ${voterV3.target}`);
  await verifyContract(voterV3.target, []);

  // Minter
  const MinterContract = await ethers.getContractFactory("MinterUpgradeable");
  const minter = await upgrades.deployProxy(
    MinterContract,
    [voterV3.target, veBXT.target, rewardsDistributor.target],
    {
      initializer: "initialize",
    }
  );

  await minter.waitForDeployment();
  console.log(`Minter deployed. Address: ${minter.target}`);
  await verifyContract(minter.target, []);

  console.log("Print contract addresses ==============>");
  console.log(`let BXTAddress = "${BXT.target}";`);
  console.log(`let veArtProxyAddress = "${veArtProxy.target}";`);
  console.log(`let veBXTAddress = "${veBXT.target}";`);
  console.log(
    `let rewardsDistributorAddress = "${rewardsDistributor.target}";`
  );
  console.log(
    `let permissionsRegistryAddress = "${permissionsRegistry.target}";`
  );
  console.log(`let bribeFactoryV3Address = "${bribeFactoryV3.target}";`);
  console.log(`let gaugeFactoryV2CLAddress = "${gaugeFactoryV2CL.target}";`);
  console.log(`let voteV3Address = "${voterV3.target}";`);
  console.log(`let minterAddress = "${minter.target}";`);
}

async function verifyContract(contractAddress: any, input: any[]) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: input,
    });
  } catch (error) {
    console.log(`Verify ${contractAddress} error`, error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
