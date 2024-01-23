import { ethers } from "hardhat";
import { encodePriceSqrt } from "../test/shared/utilities";
const WETH_ADDRESS = "0x88E1cE46b45CCD0a163D8D99b5a1C6C0503eeE59";
const USDC_ADDRESS = "0x3C77eF20C6F677DDB67362e1915E82a1439097d6";
const UNISWAP_V3_FACTORY_ADDRESS = "0x7721FFcbf6af0bd43FCE74B8C450cEeBfDCe8DE3";
// const WETH_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// const USDC_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const UNISWAP_V3_FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const DEFAULT_FEE = 3000;

async function main() {
  console.log("Deploying test pool...");

  const weth = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    WETH_ADDRESS
  );
  const usdc = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    USDC_ADDRESS
  );

  const uniswapV3Factory = await ethers.getContractAt(
    "IUniswapV3Factory",
    UNISWAP_V3_FACTORY_ADDRESS
  );

  const createPoolTx = await uniswapV3Factory.createPool(
    WETH_ADDRESS,
    USDC_ADDRESS,
    DEFAULT_FEE
  );
  await createPoolTx.wait();
  console.log(`Pool created. Tx:`, createPoolTx.hash);

  const poolAddress = await uniswapV3Factory.getPool(
    WETH_ADDRESS,
    USDC_ADDRESS,
    DEFAULT_FEE
  );

  console.log(`WETH/USDC Pool Address: `, poolAddress);

  console.log("Initializing pool...");

  const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddress);

  await pool.initialize(encodePriceSqrt("1", "1").toString());

  console.log("Pool initialized.");

  console.log("Transfer tokens to pool...");
  // adding extra liquidity into pool to make sure there's always
  // someone to swap with
  await weth.transfer(poolAddress, ethers.parseEther("1000000"));
  await usdc.transfer(poolAddress, ethers.parseEther("1000000"));

  console.log("Success.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
