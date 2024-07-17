import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZeroAddress } from "ethers";

import { expect } from "chai";
import {
  BaseXToken,
  VotingEscrow,
  IUniProxy,
  ISwapRouter,
  MockERC20,
  PermissionsRegistry,
  BribeFactoryV3,
  RewardsDistributor,
  MinterUpgradeable,
  GaugeExtraRewarder,
  IHypervisor,
  GaugeV2_CL,
  CLFeesVault,
  Bribe,
  VoterV3,
} from "../typechain-types";

const swapRouterAddress = "0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c";

// token addresses
const wethAddress = "0x4200000000000000000000000000000000000006";
const usdcAddress = "0x0Bb2b9d4fe05bbBe2D6C4276C860Ea65d85c50f0";

const uniProxyAddress = "0xE0a2DF38505099ca670Ed74677b45Fa9E9d0403E";
const hyperWETHUSDCADddress = "0x231f14ac1692e7054b95FA57AB3e8eb6A362213a";

const UNISWAP_V3_FACTORY_ADDRESS = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";
const GAMMA_FEE_RECEIPIENT = "0x0eDA51539C4A3E2989E86f1aeFeb4435FebF3Fa3";

// users
const BigHolder = ethers.getAddress(
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
); //used to add liquidity and swaps

let timestampBefore: number;
let owner: HardhatEthersSigner;
let BXT: BaseXToken;
let veBXT: VotingEscrow;
let uniProxy: IUniProxy;
let hyperWETHUSDC: IHypervisor;
let swapRouter: ISwapRouter;
let weth: MockERC20;
let usdc: MockERC20;
let permissionsRegistry: PermissionsRegistry;
let bribeFactoryV3: any;
let gaugeFactoryV2CL: any;
let voterV3: VoterV3;
let minter: MinterUpgradeable;
let lpBalanceDeposited: BigInt;
let gauge: GaugeV2_CL;
let feeVault: CLFeesVault;
let extBribe: Bribe;
let rewardsDistributor: RewardsDistributor;
let intBribe: Bribe;
let gaugeExtraRewarder: GaugeExtraRewarder;
let nftIDs: BigInt[];

describe("BaseX - Deployment Section", function () {
  beforeEach(async () => {
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore ? blockBefore.timestamp : 0;
  });

  it("Should load external contract for test (ERC20,LPs,..)", async function () {
    [owner] = await ethers.getSigners();

    BXT = await ethers.deployContract("BaseXToken");

    await BXT.waitForDeployment();

    console.log(`BXT deployed. Address: ${BXT.target}`);
    const veArtProxy = await ethers.deployContract("VeArtProxyUpgradeable");
    await veArtProxy.waitForDeployment();

    veBXT = await ethers.deployContract("VotingEscrow", [
      BXT.target,
      veArtProxy.target,
    ]);
    await veBXT.waitForDeployment();

    console.log(`veBXT deployed. Address: ${veBXT.target}`);

    rewardsDistributor = await ethers.deployContract("RewardsDistributor", [
      veBXT.target,
    ]);
    await rewardsDistributor.waitForDeployment();

    console.log(
      `rewardsDistributor deployed. Address: ${rewardsDistributor.target}`
    );

    uniProxy = await ethers.getContractAt("IUniProxy", uniProxyAddress);

    hyperWETHUSDC = await ethers.getContractAt(
      "IHypervisor",
      hyperWETHUSDCADddress
    );

    // swapRouter = await ethers.getContractAt("ISwapRouter", swapRouterAddress);

    weth = await ethers.getContractAt("MockERC20", wethAddress);
    usdc = await ethers.getContractAt("MockERC20", usdcAddress);
  });

  it("Should deploy PermissionsRegistry.sol", async function () {
    permissionsRegistry = await ethers.deployContract("PermissionsRegistry");
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    expect(await permissionsRegistry.baseXMultisig()).to.equals(owner.address);

    await permissionsRegistry.setRoleFor(owner.address, "GOVERNANCE");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("GOVERNANCE"),
        owner.address
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(owner.address, "VOTER_ADMIN");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("VOTER_ADMIN"),
        owner.address
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(owner.address, "GAUGE_ADMIN");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("GAUGE_ADMIN"),
        owner.address
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(owner.address, "BRIBE_ADMIN");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("BRIBE_ADMIN"),
        owner.address
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(owner.address, "FEE_MANAGER");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("FEE_MANAGER"),
        owner.address
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(BigHolder, "FEE_MANAGER");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("FEE_MANAGER"),
        BigHolder
      )
    ).to.equal(true);

    await permissionsRegistry.setRoleFor(owner.address, "CL_FEES_VAULT_ADMIN");
    expect(
      await permissionsRegistry.hasRole(
        await permissionsRegistry.__helper_stringToBytes("CL_FEES_VAULT_ADMIN"),
        owner.address
      )
    ).to.equal(true);
  });

  it("Should deploy BribeFactoryV3.sol", async function () {
    const BribeFactoryV3 = await ethers.getContractFactory("BribeFactoryV3");
    bribeFactoryV3 = await upgrades.deployProxy(
      BribeFactoryV3,
      [
        ZeroAddress,
        permissionsRegistry.target,
        [], // default reward tokens
      ],
      {
        initializer: "initialize",
      }
    );

    await bribeFactoryV3.waitForDeployment();

    console.log("BribeFactoryV3:", bribeFactoryV3.target);
    console.log("owner:", await bribeFactoryV3.owner());

    expect(await bribeFactoryV3.owner()).to.equal(owner.address);
  });

  it("Should deploy GaugeFactoryV2.sol", async function () {
    const GaugeFactoryV2CL = await ethers.getContractFactory(
      "GaugeFactoryV2_CL"
    );
    gaugeFactoryV2CL = await upgrades.deployProxy(
      GaugeFactoryV2CL,
      [permissionsRegistry.target, GAMMA_FEE_RECEIPIENT],
      {
        initializer: "initialize",
      }
    );

    await gaugeFactoryV2CL.waitForDeployment();

    console.log("GaugeFactoryV2_CL:", gaugeFactoryV2CL.target);

    expect(await gaugeFactoryV2CL.owner()).to.equal(owner.address);
  });

  it("Should deploy VoterV3.sol", async function () {
    const VoterV3 = await ethers.getContractFactory("VoterV3");

    voterV3 = (await upgrades.deployProxy(
      VoterV3,
      [
        veBXT.target,
        UNISWAP_V3_FACTORY_ADDRESS,
        gaugeFactoryV2CL.target,
        bribeFactoryV3.target,
      ],
      {
        initializer: "initialize",
      }
    )) as unknown as VoterV3;

    await voterV3.waitForDeployment();

    console.log("VoterV3:", voterV3.target);

    expect(await voterV3.owner()).to.equal(owner.address);
  });

  it("Should deploy Minter.sol", async function () {
    const Minter = await ethers.getContractFactory("MinterUpgradeable");

    minter = (await upgrades.deployProxy(
      Minter,
      [voterV3.target, veBXT.target, rewardsDistributor.target],
      {
        initializer: "initialize",
      }
    )) as unknown as MinterUpgradeable;

    await minter.waitForDeployment();

    console.log("minter:", minter.target);

    expect(await minter.team()).to.equal(owner.address);
  });

  it("Should set all", async function () {
    // BXT
    console.log("BXT Minter before:", await BXT.minter());
    await BXT.initialMint(owner.address);

    const bxtBalance = await BXT.balanceOf(owner.address);
    console.log("BXT Balance:", bxtBalance);

    await BXT.setMinter(minter.target);
    console.log(
      "BXT Minter after:",
      await BXT.minter(),
      minter.target,
      owner.address
    );

    //voter
    await voterV3._init(
      [wethAddress, usdcAddress],
      permissionsRegistry.target,
      minter.target
    );

    //minter
    await minter._initialize(
      [owner.address],
      [BigInt(10_000 * 1e18).toString()],
      BigInt(50 * 1e6 * 1e18).toString()
    );

    await rewardsDistributor.setDepositor(minter.target);

    // set voter to veBXT
    await veBXT.setVoter(voterV3.target);
    expect(await veBXT.voter()).to.equal(voterV3.target);

    expect(await voterV3.isWhitelisted(usdcAddress)).to.equal(true);
    expect(await voterV3.permissionRegistry()).to.equal(
      permissionsRegistry.target
    );
    // await voterV3.addFactory(gaugeFactoryV2CL.target);
    expect(await voterV3.isGaugeFactory(gaugeFactoryV2CL.target)).to.equal(
      true
    );

    // bribe factory
    await bribeFactoryV3.setVoter(voterV3.target);
    expect(await bribeFactoryV3.voter()).to.equal(voterV3.target);
  });
});

describe("BaseX - LP Section", function () {
  beforeEach(async () => {
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore ? blockBefore.timestamp : 0;
  });

  it("Should add Liquidity", async function () {
    const amount0 = ethers.parseEther("10");

    const [suggestedAmount] = await uniProxy.getDepositAmount(
      hyperWETHUSDCADddress,
      wethAddress,
      amount0
    );

    console.log("To deposit ", amount0, "WETH");
    console.log("Hypervisor suggest deposit USDC amount:", suggestedAmount);

    await weth.approve(hyperWETHUSDCADddress, amount0);
    await usdc.approve(hyperWETHUSDCADddress, amount0);

    await uniProxy.deposit(
      amount0.toString(),
      amount0.toString(),
      owner.address,
      hyperWETHUSDCADddress,
      [0, 0, 0, 0]
    );

    lpBalanceDeposited = await hyperWETHUSDC.balanceOf(owner.address);
    expect(lpBalanceDeposited).to.be.above(0);

    console.log("lpBalanceDeposited:", lpBalanceDeposited);
  });
});

describe("BaseX - Gauge Section", function () {
  beforeEach(async () => {
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore ? blockBefore.timestamp : 0;
  });

  it("Should create Gauge for Concentrated liqudity", async function () {
    await voterV3.createGauges([hyperWETHUSDCADddress], [0]);
    const gaugeAddress = await voterV3.gauges(hyperWETHUSDCADddress);
    const extBribeAddress = await voterV3.external_bribes(gaugeAddress);
    const intBribeAddress = await voterV3.internal_bribes(gaugeAddress);

    console.log("gaugeAddress:", gaugeAddress);
    console.log("extBribeAddress:", extBribeAddress);
    console.log("intBribeAddress:", intBribeAddress);
    expect(gaugeAddress).not.to.equal(ZeroAddress);
    expect(intBribeAddress).not.to.equal(ZeroAddress);
    expect(intBribeAddress).not.to.equal(ZeroAddress);

    gauge = await ethers.getContractAt("GaugeV2_CL", gaugeAddress);
    feeVault = await ethers.getContractAt(
      "CLFeesVault",
      await gauge.feeVault()
    );
    extBribe = await ethers.getContractAt("Bribe", extBribeAddress);
    intBribe = await ethers.getContractAt("Bribe", intBribeAddress);
    console.log("symbol: ", await intBribe.TYPE());
  });

  it("Should deploy extra rewarder for hypervisor gauge", async function () {
    // deploy
    gaugeExtraRewarder = await ethers.deployContract("GaugeExtraRewarder", [
      wethAddress,
      gauge.target,
    ]);

    await gaugeExtraRewarder.waitForDeployment();

    console.log("gaugeExtraRewarder: ", gaugeExtraRewarder.target);
    expect(await gaugeExtraRewarder.owner()).to.equal(owner.address);

    await gaugeFactoryV2CL.setGaugeRewarder(
      [gauge.target],
      [gaugeExtraRewarder.target]
    );

    const amountIn = ethers.parseEther("10000");
    expect(await weth.balanceOf(gaugeExtraRewarder.target)).to.be.equal(0);
    await weth.transfer(gaugeExtraRewarder.target, amountIn);
    expect(await weth.balanceOf(gaugeExtraRewarder.target)).to.be.equal(
      amountIn
    );

    await gaugeExtraRewarder.setDistributionRate(ethers.parseEther("0.015"));
  });

  it("Should deposit into the gauge", async function () {
    expect(await gauge.balanceOf(owner.address)).to.be.equal(0);
    await hyperWETHUSDC.approve(gauge.target, lpBalanceDeposited.toString());
    await gauge.depositAll();
    const balance = await gauge.balanceOf(owner.address);
    expect(balance).to.be.above(0);
    console.log("Deposited balance:", balance.toString());
  });

  it("Should send fees to vault", async function () {
    const amountIn = ethers.parseEther("100");
    let wethBalance = await weth.balanceOf(feeVault.target);
    let usdcBalance = await usdc.balanceOf(feeVault.target);
    expect(wethBalance).to.be.equal(0);
    expect(usdcBalance).to.be.equal(0);
    await weth.transfer(feeVault.target, amountIn);
    await usdc.transfer(feeVault.target, amountIn);
    wethBalance = await weth.balanceOf(feeVault.target);
    usdcBalance = await usdc.balanceOf(feeVault.target);
    expect(wethBalance).to.be.equal(amountIn);
    expect(usdcBalance).to.be.equal(amountIn);
    // await weth.transfer(feeVault.target, amountIn);

    console.log("FeeVault Address:", feeVault.target);
    console.log("WETH Balance of FeeVault:", wethBalance);
    console.log("USDC Balance of FeeVault:", usdcBalance);
  });

  it("Should claim fees from vault", async function () {
    const intBribeAddress = intBribe.target;
    let wethBalance = await weth.balanceOf(intBribeAddress);
    let usdcBalance = await usdc.balanceOf(intBribeAddress);
    console.log("IntBribe address:", intBribeAddress);
    console.log(
      "Balances before distribute fees:",
      "WETH:",
      wethBalance,
      "USDC:",
      usdcBalance
    );

    expect(wethBalance).to.equal(0);
    await voterV3.distributeFees([gauge.target]);
    wethBalance = await weth.balanceOf(intBribeAddress);
    usdcBalance = await usdc.balanceOf(intBribeAddress);
    expect(wethBalance).to.above(0);
    console.log(
      "Balances after distribute fees:",
      "WETH:",
      wethBalance,
      "USDC:",
      usdcBalance
    );
  });
});

describe("BaseX - Voter Section", function () {
  beforeEach(async () => {
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore ? blockBefore.timestamp : 0;
  });

  it("Should lock BXT to get veBXT", async function () {
    // const lockAmount = ethers.parseEther("1000");
    // await BXT.approve(veBXT.target, lockAmount);

    // console.log("allowance:", await BXT.allowance(owner.address, veBXT.target));

    // await veBXT.create_lock(lockAmount, 2 * 7 * 86400); //create lock for 2 weeks

    const veBXTCount = await veBXT.balanceOf(owner.address);
    expect(veBXTCount).to.above(0);
    console.log("veBXT Count:", veBXTCount);
    const promises = [];
    for (let i = 0; i < veBXTCount; i++) {
      promises.push(veBXT.tokenOfOwnerByIndex(owner.address, i));
    }
    nftIDs = await Promise.all(promises);
    console.log("veBXT NFT IDs:", nftIDs);
  });

  it("Should vote", async function () {
    const toVoteNFTID = Number(nftIDs[nftIDs.length - 1]);
    const votingPower = await veBXT.balanceOfNFT(toVoteNFTID);
    console.log("To vote NFT ID", toVoteNFTID);
    console.log("Vote power:", votingPower);

    await voterV3.vote(toVoteNFTID, [hyperWETHUSDCADddress], [100]);
    console.log("total weight:", await voterV3.totalWeight());
  });

  it("Should send rewards to voter and distribute", async function () {
    const amountIn = ethers.parseEther("1000");
    await BXT.approve(voterV3.target, amountIn);
    let blockNum = await ethers.provider.getBlockNumber();
    let block = await ethers.provider.getBlock(blockNum);
    const activePeriod = await minter.active_period();
    console.log("Block timestamp before:", block?.timestamp);
    console.log("ActivePeriod:", activePeriod);
    await ethers.provider.send("evm_increaseTime", [7 * 86400]);
    await ethers.provider.send("evm_mine");
    blockNum = await ethers.provider.getBlockNumber();
    block = await ethers.provider.getBlock(blockNum);
    console.log("Block timestamp after:", block?.timestamp);
    console.log("checked:", await minter.check());
    await minter.update_period();

    const balance = await BXT.balanceOf(voterV3.target);
    console.log("BXT Balance of voter:", balance);
    // expect(balance).to.equal(amountIn);

    console.log("BXT Balance of minter:", await BXT.balanceOf(minter.target));

    console.log("Minter of BXT", await BXT.minter());

    expect(await BXT.balanceOf(gauge.target)).to.equal(0);

    await voterV3.distributeAll();

    const balanceOfGauge = await BXT.balanceOf(gauge.target);
    expect(balanceOfGauge).to.above(0);

    console.log("Gauge BXT balance after distribute all:", balanceOfGauge);
  });
});

describe("Thena - Claim rewards Section", function () {
  beforeEach(async () => {
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore ? blockBefore.timestamp : 0;
  });

  it("Should harvest from gauge + extra rewarder", async function () {
    const balanceBefore = await BXT.balanceOf(owner.address);
    console.log("BXT balance before getReward: ", balanceBefore);
    await gauge["getReward()"]();
    const balancAfter = await BXT.balanceOf(owner.address);
    console.log("BXT balance after getReward: ", balancAfter);
    expect(balancAfter).to.above(balanceBefore);
  });

  it("Should get intBribes", async function () {
    await ethers.provider.send("evm_increaseTime", [8 * 86400]);
    await ethers.provider.send("evm_mine");
    await voterV3.distributeAll();
    await ethers.provider.send("evm_increaseTime", [8 * 86400]);
    await ethers.provider.send("evm_mine");
    await voterV3.distributeAll();

    const balanceBefore = await weth.balanceOf(owner.address);
    console.log("WETH balance before get intBribes: ", balanceBefore);
    await intBribe["getReward(address[])"]([weth.target]);
    const balancAfter = await weth.balanceOf(owner.address);
    console.log("WETH balance after get intBribes: ", balancAfter);
    expect(balancAfter).to.above(balanceBefore);

    // claimFees()
  });
});
