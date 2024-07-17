import { ethers, upgrades } from "hardhat";
import hre from "hardhat";


const veBXTAddress = "0x7126c99Eb4D74eC9F04621897B7bD0ca64a7A9f2";
async function main() {
  console.log("Deploying contracts...");
 
  // Airdrop
  let input = [veBXTAddress];
  const ad = await ethers.deployContract("VeBXT_Airdrop", input);
  await ad.waitForDeployment();
  console.log(`Airdrop deployed. Address:==========> ${ad.target}`);
  await verifyContract(ad.target, input);

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
