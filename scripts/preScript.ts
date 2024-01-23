import { ethers } from "hardhat";

async function main() {
  const owner = "0x3404F40b1917ddBdb7D31Bf5f68345F60da8B2C2";
  const wethAddress = "0x88E1cE46b45CCD0a163D8D99b5a1C6C0503eeE59";
  const usdcAddress = "0x20b6bCC093029c31C65db62C634ab71172d86Ebc";

  let hypervisorFactoryAddress = "0x8aeB539A854158790F605c4179559cf2E7Ef2F65";
  let hyperWETHUSDCADddress = "0x1bfDa7de87352A5d7A33B52A35ca7EF6B35ef9EA";
  let uniProxyAddress = "0x516AED19EaC53189D05685F5890ce96b48D91E33";

  let BXTAddress = "0x20cb8cCAe8f39d6046c32F23a807e949066051FD";
  let veArtProxyAddress = "0x58e168b916Cf5e20AD35EFA4fFC07BEc119393B7";
  let veBXTAddress = "0x975A82B2989C8df9cD3Bc0E48A34e9Dc7A8eCE94";
  let rewardsDistributorAddress = "0x965e55D20470BE722d55d16d8CBdDeFda977503A";
  let permissionsRegistryAddress = "0x1DED1a7CEEc1C05Bc8721841Aef60737e3984Cfa";
  let bribeFactoryV3Address = "0xfDEAD4800F87B82B98c73583b15a2A081DAa6ec2";
  let gaugeFactoryV2CLAddress = "0xc460f533770F44bC9aF4dDCE879c16F118Dd0D34";
  let voteV3Address = "0x50263AF5b4e2d063500f72ca0c690dA932FfF4EC";
  let minterAddress = "0x3a4603E680795a7013C0d1e6b2a929E4d57425cd";

  // let BXTAddress = "0xD110adcB2566af037eE2BD546Eb3566dE362D1D7";
  // let veArtProxyAddress = "0x70D6ebB038D89B4cEE80c78DC131Aca1c411a7F8";
  // let veBXTAddress = "0x2ED261A4E0390834D54137bC8eC240f60A0eC7Fb";
  // let rewardsDistributorAddress = "0x7E342297C17b595d9f66889f99D30295a7739674";
  // let permissionsRegistryAddress = "0xDca74c8F59D42F46A95c0AE081F8046C3e719d3D";
  // let bribeFactoryV3Address = "0x2218C5eA9B03A199148A0cf7d30d5C494231bB50";
  // let gaugeFactoryV2CLAddress = "0x16C75003730dBd1718bdD1DdA5D8a7389B7a341B";
  // let voteV3Address = "0x6079f8B37980181b4aC09610f6Ff4088A87Bc282";
  // let minterAddress = "0x04c191685443eAcDF65d3d474FD70B666A1691bC";

  // BXT
  const BXT = await ethers.getContractAt("BaseXToken", BXTAddress);
  console.log("BXT Minter before:", await BXT.minter());
  await BXT.initialMint(owner);

  const bxtBalance = await BXT.balanceOf(owner);
  console.log("BXT Balance:", bxtBalance);

  await BXT.setMinter(minterAddress);
  console.log("BXT Minter after:", await BXT.minter());

  //voter
  const voterV3 = await ethers.getContractAt("VoterV3", voteV3Address);
  await voterV3._init(
    [wethAddress, usdcAddress],
    permissionsRegistryAddress,
    minterAddress
  );

  //minter
  const minter = await ethers.getContractAt("MinterUpgradeable", minterAddress);
  await minter._initialize([], [], 0);

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

  // gaugeExtraRewardser
  //   const voterV3 = await ethers.getContractAt("VoterV3", voteV3Address);
  //   const gaugeFactoryV2CL = await ethers.getContractAt(
  //     "GaugeFactoryV2_CL",
  //     gaugeFactoryV2CLAddress
  //   );

  //   const gaugeAddress = await voterV3.gauges(hyperWETHUSDCADddress);
  //   console.log("gaugeAddress", gaugeAddress)
  //   const gaugeExtraRewarder = await ethers.deployContract("GaugeExtraRewarder", [
  //     wethAddress,
  //     gaugeAddress,
  //   ]);

  //   await gaugeFactoryV2CL.setGaugeRewarder(
  //     [gaugeAddress],
  //     [gaugeExtraRewarder.target]
  //   );

  //   await gaugeExtraRewarder.setDistributionRate(ethers.parseEther("0.015"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
