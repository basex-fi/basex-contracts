import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  // let BXTAddress = "0x43bd8B83A45b9196a4303074953C424a0321A1F8";
  // let veArtProxyAddress = "0x6AB495EDdBe435F9aC59Da31Cf2831a82fa3C094";
  // let veBXTAddress = "0x994745Ab6cF6A36076446Bc1B8476E3bdCb80e70";
  // let rewardsDistributorAddress = "0xb6429F48311A5B27D500D309cd683664eE5269d9";
  // let permissionsRegistryAddress = "0x5097b84cea5fd61F538a3A5d9BeFbC0A7987BbfF";
  // let bribeFactoryV3Address = "0x36c1f5E760cf1E7a0957D972699960dA4FccD73e";
  // let gaugeFactoryV2CLAddress = "0x25A163e38c2ADe7EBe43a92AeBd419141269E331";
  // let voteV3Address = "0x83F921aA26826794bCE5Dc6a967aa8960Af9846f";
  // let minterAddress = "0x54B4FBDc48B8991F24d486eC02Af840E8dC0c81f";

  // const owner = "0x3404F40b1917ddBdb7D31Bf5f68345F60da8B2C2";
  // const token0 = "0x4200000000000000000000000000000000000006";
  // const token1 = BXTAddress;
  // let hyperAddress = "0x8f0d4e957De8Bf4ED384ED7fcFc475404FB7b4f6";

  // mainnet
  let BXTAddress = "0xB97008CA4F8D72C81489d6728c0036c0C4187ce8";
  let veArtProxyAddress = "0xDBeDC64B664D2AFA27afa309a1ed67D486d4fc7d";
  let veBXTAddress = "0x1194e11e8f9CaA9106bb2b07CbB7c4231e8dE943";
  let rewardsDistributorAddress = "0xcbDf501CBab8c5994C8F9a337Dfe5e35eD70c748";
  let permissionsRegistryAddress = "0x2E152e557012629C69E2d2E6349733323B6D6796";
  let bribeFactoryV3Address = "0xe3Cae1B9d1a8C58F6f25125851700B8aD24bfA21";
  let gaugeFactoryV2CLAddress = "0x6103568f1f024DA81a363512c08a5d9247eEa08a";
  let voteV3Address = "0x1368DA5bAA4809ddde62EcBe0a9c778EC0128F31";
  let minterAddress = "0xE92A4251ec3bADE70685b463910a23E076353f9e";

  const owner = "0xE4DE24CeA85C9bEB09D2269A86dcc364910Ea130";
  // const token0 = "0x4200000000000000000000000000000000000006";
  // const token1 = BXTAddress;
  const WETH = "0x4200000000000000000000000000000000000006";
  const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
  const BXTToken = BXTAddress;
  const DAI = "0x50c5725949a6f0c72e6c4a641f24049a917db0cb";
  const AERO = "0x940181a94a35a4569e4529a3cdfb74e38fd98631";
  const cbETH = "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22";
  const USDbC = "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca";
  const tBTC = "0x236aa50979d5f3de3bd1eeb40e81137f22ab794b";
  const wstETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
  const axIUSDC = "0xeb466342c4d449bc9f53a865d5cb90586f405215";

  // BXT
  const BXT = await ethers.getContractAt("BaseXToken", BXTAddress);
  console.log("BXT Minter before:", await BXT.minter());
  // await BXT.initialMint(owner);

  const bxtBalance = await BXT.balanceOf(owner);
  console.log("BXT Balance:", bxtBalance);

  await BXT.setMinter(minterAddress);
  console.log("BXT Minter after:", await BXT.minter());

  // permissionsRegistry
  const permissionsRegistry = await ethers.getContractAt(
    "PermissionsRegistry",
    permissionsRegistryAddress
  );
  await permissionsRegistry.setRoleFor(owner, "GOVERNANCE");
  await permissionsRegistry.setRoleFor(owner, "VOTER_ADMIN");
  await permissionsRegistry.setRoleFor(owner, "GAUGE_ADMIN");
  await permissionsRegistry.setRoleFor(owner, "BRIBE_ADMIN");
  await permissionsRegistry.setRoleFor(owner, "FEE_MANAGER");
  await permissionsRegistry.setRoleFor(owner, "CL_FEES_VAULT_ADMIN");

  //voter
  const voterV3 = await ethers.getContractAt("VoterV3", voteV3Address);
  await voterV3._init(
    // [token0, token1],
    [WETH, USDC, BXTToken, DAI, AERO, cbETH, USDbC, tBTC, wstETH, axIUSDC],
    permissionsRegistryAddress,
    minterAddress
  );

  //minter
  const minter = await ethers.getContractAt("MinterUpgradeable", minterAddress);
  await minter._initialize([], [], 0); //TODO params

  //   rewardsDistributor
  const rewardsDistributor = await ethers.getContractAt(
    "RewardsDistributor",
    rewardsDistributorAddress
  );
  await rewardsDistributor.setDepositor(minterAddress);

  // set voter to veBXT
  const veBXT = await ethers.getContractAt("VotingEscrow", veBXTAddress);
  await veBXT.setVoter(voteV3Address);

  // bribe factory
  const bribeFactoryV3 = await ethers.getContractAt(
    "BribeFactoryV3",
    bribeFactoryV3Address
  );
  await bribeFactoryV3.setVoter(voteV3Address);

  // gaugeExtraRewardser (after create gauge)

  /* const voterV3 = await ethers.getContractAt("VoterV3", voteV3Address);
  const gaugeFactoryV2CL = await ethers.getContractAt(
    "GaugeFactoryV2_CL",
    gaugeFactoryV2CLAddress
  );

  const gaugeAddress = await a.gauges(hyperAddress);
  console.log("gaugeAddress", gaugeAddress);
  const input = [token0, gaugeAddress];
  const gaugeExtraRewarder = await ethers.deployContract(
    "GaugeExtraRewarder",
    input
  );

  await verifyContract(gaugeExtraRewarder.target, input);

  await gaugeFactoryV2CL.setGaugeRewarder(
    [gaugeAddress],
    [gaugeExtraRewarder.target]
  );

  await gaugeExtraRewarder.setDistributionRate(ethers.parseEther("0.015")); */
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
