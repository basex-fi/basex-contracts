import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Deploying tokens and reward distributor...");

  // TUSDCToken
  /* const tusdc = await ethers.deployContract("TUSDCToken");
  await tusdc.waitForDeployment();
  await verifyContract(tusdc.target, []);

  console.log(`TUSDCToken deployed. Address: ${tusdc.target}`); */

  /* const bxt = await ethers.deployContract("BaseXToken");
  await bxt.waitForDeployment();
  await verifyContract(bxt.target, []);

  console.log(`BXT deployed. Address: ${bxt.target}`); */
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
