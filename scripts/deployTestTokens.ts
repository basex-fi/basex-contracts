import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Deploying test tokens...");

  const [owner] = await ethers.getSigners();

  // const weth = await ethers.deployContract("MockERC20", [
  //   "Wrapped Ethereum",
  //   "WETH",
  //   "1000000000000000000000000"
  // ]);

  // console.log(`WETH deployed. Address: ${weth.target}`);
  // let balance = await weth.balanceOf(owner.address);
  // console.log(`WETH Balance of Owner: ${balance}`);

  // await hre.run("verify:verify", {
  //   address: weth.target,
  //   constructorArguments: ["Wrapped Ethereum", "WETH", "1000000000000000000000000"],
  //   // contract: "contracts/utils/MockERC20.sol:MockERC20",
  // });

  /*  const usdc = await ethers.deployContract("MockERC20", [
    "USD Coin",
    "USDC",
    "1000000000000000000000000",
  ]);

  console.log(`USDC deployed. Address: ${usdc.target}`); */
  let input = ["Dai Coin", "DAI", "1000000000000000000000000"];
  let token = await ethers.deployContract("MockERC20", input);
  console.log(`DAI deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["USDC Coin", "USDC", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`USDC deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["cbETH Coin", "cbETH", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`cbETH deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["AERO Coin", "AERO", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`AERO deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["USDbC Coin", "USDbC", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`USDbC deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["wstETH Coin", "wstETH", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`wstETH deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["tBTC Coin", "tBTC", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`tBTC deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);

  input = ["axIUSDC Coin", "axIUSDC", "1000000000000000000000000"];
  token = await ethers.deployContract("MockERC20", input);
  console.log(`axIUSDC deployed. Address:====> ${token.target}`);

  verifyContract(token.target, input);
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
