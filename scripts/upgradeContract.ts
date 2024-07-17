import { ethers, upgrades } from "hardhat";

const bribeFactoryV3Address = "";
const voteV3Address = "0x713F130B76c69c1E21941f5506678e9d71f6a657";
const minterAddress = "";
const pairAPIAddress = "";
const veNFTAPIAddress = "0x6b930481601891E67E0845B629E4d3463D965eEc";
const rewardAPIAddress = "";

// upgrade BribeFactoryV3
async function upgradeBribeFactoryV3() {
  const data = await ethers.getContractFactory("BribeFactoryV3");
  console.log("upgrading...");
  await upgrades.upgradeProxy(bribeFactoryV3Address, data);
  console.log("upgraded...");
}

// upgrade VoterV3
async function upgradeVoterV3() {
  const data = await ethers.getContractFactory("VoterV3");
  console.log("upgrading...");
  await upgrades.upgradeProxy(voteV3Address, data);
  console.log("upgraded...");
}

// upgrade MinterUpgradeable
async function upgradeMinter() {
  const data = await ethers.getContractFactory("MinterUpgradeable");
  console.log("upgrading...");
  await upgrades.upgradeProxy(minterAddress, data);
  console.log("upgraded...");
}

// upgrade RewardAPI
async function upgradePairAPI() {
  const data = await ethers.getContractFactory("PairAPI");
  console.log("upgrading...");
  await upgrades.upgradeProxy(pairAPIAddress, data);
  console.log("upgraded...");
}

// upgrade veNFTAPI
async function upgradeveNFTAPI() {
  const data = await ethers.getContractFactory("veNFTAPI");
  console.log("upgrading...");
  await upgrades.upgradeProxy(veNFTAPIAddress, data);
  console.log("upgraded...");
}

// upgrade RewardAPI
async function upgradeRewardAPI() {
  const data = await ethers.getContractFactory("RewardAPI");
  console.log("upgrading...");
  await upgrades.upgradeProxy(rewardAPIAddress, data);
  console.log("upgraded...");
}

async function main() {
  // await upgradeBribeFactoryV3();
  await upgradeVoterV3();
  // await upgradeMinter();
  
  // await upgradePairAPI();
  // await upgradeveNFTAPI();
  // await upgradeRewardAPI();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
