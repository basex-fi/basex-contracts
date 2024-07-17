import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Deploying tokens and reward distributor...");

  // WETH
  const weth = await ethers.deployContract("WETH9");
  await weth.waitForDeployment();
  await verifyContract(weth.target, []);

  console.log(`WETH deployed. Address: ${weth.target}`);
  
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
