import { ethers, upgrades } from "hardhat";
import { ZeroAddress } from "ethers";
import hre from "hardhat";


async function main() {
  console.log("Deploying IFO contracts...");

  // IFODeployerV3
  const IFODeployerV3 = await ethers.deployContract("IFODeployerV3");
  await IFODeployerV3.waitForDeployment();
  console.log(`BXT deployed. Address: ${IFODeployerV3.target}`);
  await verifyContract(IFODeployerV3.target, []);

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
