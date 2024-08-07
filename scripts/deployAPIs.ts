import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

const voterV3 = "0x1368DA5bAA4809ddde62EcBe0a9c778EC0128F31";
const rewardDistributor = "0xcbDf501CBab8c5994C8F9a337Dfe5e35eD70c748";

async function main() {
  console.log("Deploying APIs...");

  // PAIR API
  const pairAPIContract = await ethers.getContractFactory("PairAPI");
  const pairAPI = await upgrades.deployProxy(pairAPIContract, [voterV3], {
    initializer: "initialize",
  });
  await pairAPI.waitForDeployment();
  console.log(`PairAPI deployed. Address========> : ${pairAPI.target}`);

  await hre.run("verify:verify", {
    address: pairAPI.target,
    constructorArguments: [],
  });

  // veNFT API
  const veNFTAPIContract = await ethers.getContractFactory("veNFTAPI");
  const veNFTAPI = await upgrades.deployProxy(
    veNFTAPIContract,
    [voterV3, rewardDistributor, pairAPI.target],
    {
      initializer: "initialize",
    }
  );
  await veNFTAPI.waitForDeployment();
  console.log(`veNFTAPI deployed. Address========> : ${veNFTAPI.target}`);

  await hre.run("verify:verify", {
    address: veNFTAPI.target,
    constructorArguments: [],
  });

  // REWARD API
  const rewardAPIContract = await ethers.getContractFactory("RewardAPI");
  const rewardAPI = await upgrades.deployProxy(rewardAPIContract, [voterV3], {
    initializer: "initialize",
  });
  await rewardAPI.waitForDeployment();
  console.log(`RewardAPI deployed. Address========> : ${rewardAPI.target}`);

  await hre.run("verify:verify", {
    address: rewardAPI.target,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
