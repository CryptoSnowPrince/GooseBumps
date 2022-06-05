import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { Greeter } from "../typechain"
import gooseBumpsStakingAbi from "../artifacts/contracts/Stake/GooseBumpsStaking.sol/GooseBumpsStaking.json"

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract } from "ethers";

let accountList: SignerWithAddress[];
let gooseBumpsStaking: Contract;
let _stakeToken: string;
let _rewardsToken: string;

before(async function () {
    accountList = await ethers.getSigners();

    let name_ = "Roburna Stake Token"
    let symbol_ = "Stake Token"

    const Token = await ethers.getContractFactory("Token");
    const stakeToken = await Token.deploy(name_, symbol_);

    await stakeToken.deployed();

    console.log("stakeToken deployed to:", stakeToken.address);

    const _stakeToken = stakeToken.address;

    name_ = "Roburna Reward Token"
    symbol_ = "Reward Token"

    const rewardToken = await Token.deploy(name_, symbol_);

    console.log("rewardToken deployed to:", rewardToken.address);

    const _rewardsToken = rewardToken.address;
    const _treasury = await stakeToken.owner();
    console.log("Treasury: ", _treasury);
    const _rewardWallet = await rewardToken.owner();
    console.log("Reward Wallet: ", _rewardWallet);
    const _rewardPerBlockTokenN = 100;
    const _rewardPerBlockTokenD = 100;

    const GooseBumpsStaking = await ethers.getContractFactory("GooseBumpsStaking");
    gooseBumpsStaking = await GooseBumpsStaking.deploy(_stakeToken, _rewardsToken, _treasury, _rewardWallet, _rewardPerBlockTokenN, _rewardPerBlockTokenD);

    await gooseBumpsStaking.deployed();

    console.log("GooseBumpsStaking deployed to:", gooseBumpsStaking.address);

    // console.log(accountList.length)
    // for (let i = 0; i < accountList.length; i++)
    //     console.log("## ", accountList[i].address);
})

describe("GooseBumpsStaking Test", function () {

    describe("setTreasury Test", function () {
        it("Set success", async function () {
            const setTreasuryTx = await gooseBumpsStaking.connect(accountList[0]).setTreasury(accountList[1].address);

            // wait until the transaction is mined
            await setTreasuryTx.wait();

            expect(await gooseBumpsStaking.connect(accountList[0]).TREASURY()).to.equal(accountList[1].address);
        });

        it("Set fail because setter is not owner", async function () {
            await expect(gooseBumpsStaking.connect(accountList[1]).setTreasury(accountList[0].address)).to.revertedWith('Ownable: caller is not the owner');
        });

        it("Set success and emit LogSetTreasury", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setTreasury(accountList[0].address))
                .to.emit(gooseBumpsStaking, "LogSetTreasury").withArgs(accountList[0].address);

            expect(await gooseBumpsStaking.connect(accountList[1]).TREASURY()).to.equal(accountList[0].address);
        });
    });

    describe("setRewardWallet Test", function () {
        it("Set success", async function () {
            const setRewardWalletTx = await gooseBumpsStaking.connect(accountList[0]).setRewardWallet(accountList[2].address);

            // wait until the transaction is mined
            await setRewardWalletTx.wait();

            expect(await gooseBumpsStaking.connect(accountList[0]).REWARD_WALLET()).to.equal(accountList[2].address);
        });

        it("Set fail because setter is not owner", async function () {
            await expect(gooseBumpsStaking.connect(accountList[1]).setRewardWallet(accountList[0].address)).to.revertedWith('Ownable: caller is not the owner');
        });

        it("Set success and emit LogSetRewardWallet", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setRewardWallet(accountList[0].address))
                .to.emit(gooseBumpsStaking, "LogSetRewardWallet").withArgs(accountList[0].address);

            expect(await gooseBumpsStaking.connect(accountList[1]).TREASURY()).to.equal(accountList[0].address);
        });
    });

    describe("setPause and setUnpause Test", function () {
        it("setPause success", async function () {
            const setPauseTx = await gooseBumpsStaking.connect(accountList[0]).setPause();

            // wait until the transaction is mined
            await setPauseTx.wait();

            expect(await gooseBumpsStaking.connect(accountList[0]).paused()).to.equal(true);
        });

        it("setPause fail because already paused", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setPause()).to.revertedWith('Pausable: paused');
        });

        it("setUnpause success", async function () {
            const setUnpauseTx = await gooseBumpsStaking.connect(accountList[0]).setUnpause();

            await setUnpauseTx.wait();

            expect(await gooseBumpsStaking.connect(accountList[0]).paused()).to.equal(false);
        });

        it("setUnpause fail because already unpaused", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setUnpause()).to.revertedWith('Pausable: not paused');
        });

        it("setPause fail because setter is not owner", async function () {
            await expect(gooseBumpsStaking.connect(accountList[1]).setPause()).to.revertedWith('Ownable: caller is not the owner');
        });

        it("setUnpause fail because setter is not owner", async function () {
            await expect(gooseBumpsStaking.connect(accountList[1]).setUnpause()).to.revertedWith('Ownable: caller is not the owner');
        });

        it("setPause success and emit Paused", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setPause())
                .to.emit(gooseBumpsStaking, "Paused").withArgs(accountList[0].address);

            expect(await gooseBumpsStaking.connect(accountList[1]).paused()).to.equal(true);
        });

        it("setUnpause success and emit Unpaused", async function () {
            await expect(gooseBumpsStaking.connect(accountList[0]).setUnpause())
                .to.emit(gooseBumpsStaking, "Unpaused").withArgs(accountList[0].address);

            expect(await gooseBumpsStaking.connect(accountList[1]).paused()).to.equal(false);
        });
    });

});
