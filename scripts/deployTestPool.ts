import { ethers } from "hardhat";
import { encodePriceSqrt } from "../test/shared/utilities";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const USDC_ADDRESS = "0x46A4382851114EF908A23F6f0AfeAe77f7022f6D";
const UNISWAP_V3_FACTORY_ADDRESS = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

const DEFAULT_FEE = 3000;

let DAI = "0xa99ece9292CF889A5a8fE98E693D4066B255D711";
// let USDC = "0x46A4382851114EF908A23F6f0AfeAe77f7022f6D";
let cbETH = "0x5314745E120cb4183b5344740a0EAE8E5f214125";
let AERO = "0x55570637b030D1bC4cfB311cB420A4972E884DDd";
let USDbC = "0x9A84513926A8CDd05FD0510b406508Df0B742ac0";
let wstETH = "0x606C2A6345c134F0BEF3708DA7853B64AFD45f48";
let tBTC = "0x0F35497Eeed1011768bBdAd0247c65f05A170D91";


// DAI-USDC
// cbETH-WETH
// WETH-AERO
async function main() {
  console.log("Deploying test pool...");

  const uniswapV3Factory = await ethers.getContractAt(
    "IUniswapV3Factory",
    UNISWAP_V3_FACTORY_ADDRESS
  );

  const createPoolTx = await uniswapV3Factory.createPool(
    DAI,
    USDC_ADDRESS,
    DEFAULT_FEE
  );
  await createPoolTx.wait();
  console.log(`Pool created. Tx:`, createPoolTx.hash);

  const poolAddress = await uniswapV3Factory.getPool(
    DAI,
    USDC_ADDRESS,
    DEFAULT_FEE
  );

  console.log(`WETH/DAI Pool Address: `, poolAddress);

  /* 
  const weth = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    WETH_ADDRESS
  );
  const usdc = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    USDC_ADDRESS
  );
 
  console.log("Initializing pool...");

  const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddress);

  await pool.initialize(encodePriceSqrt("1", "1").toString());

  console.log("Pool initialized.");

  console.log("Transfer tokens to pool...");
  // adding extra liquidity into pool to make sure there's always
  // someone to swap with
  await weth.transfer(poolAddress, ethers.parseEther("1000000"));
  await usdc.transfer(poolAddress, ethers.parseEther("1000000"));

  console.log("Success."); */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
