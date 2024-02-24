import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multisig Test", () => {
  async function deployMultiSigContract() {
    const quorum = 3;
    const amount = ethers.parseEther("1");
    const ContractLiquidity = ethers.parseEther("900");
    const receiver = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();
    const signers = [
      owner.address,
      user1.address,
      user2.address,
      user3.address,
      user4.address,
    ];

    const Multisig = await ethers.getContractFactory("MultiSig");
    const multisig = await Multisig.deploy(signers, quorum);

    owner.sendTransaction({ value: ContractLiquidity, to: multisig.target });

    return {
      quorum,
      owner,
      user1,
      user2,
      user3,
      user4,
      signers,
      multisig,
      amount,
      receiver,
    };
  }

  describe("Initiate Transcation", () => {
    it("Should  Initiate Transcation properly", async () => {
      const { owner, multisig, amount, receiver } = await loadFixture(
        deployMultiSigContract
      );

      const Tx = await multisig
        .connect(owner)
        .initiateTransaction(amount, receiver);
      await Tx.wait();

      const Transcations = await multisig.connect(owner).getAllTransactions();
      expect(Transcations[0].amount).to.eq(amount);
    });
  });

  describe("Approve transcation", () => {
    it("Should approve traanscations properly", async () => {
      const {
        quorum,
        owner,
        user1,
        user2,
        user3,
        user4,
        signers,
        multisig,
        amount,
        receiver,
      } = await loadFixture(deployMultiSigContract);

      const Tx = await multisig
        .connect(owner)
        .initiateTransaction(amount, receiver);
      await Tx.wait();
      const receiverBalb4 = await ethers.provider.getBalance(receiver);
      console.log(receiverBalb4, "Receiver balance before");
      const Transcations = await multisig.connect(owner).getAllTransactions();
      const _id = Transcations[0].id;
      const approveTx = await multisig.connect(user1).approveTransaction(_id);
      await approveTx.wait();
      const approveTx1 = await multisig.connect(user2).approveTransaction(_id);
      await approveTx1.wait();
      console.log(amount, "amount");
      const receiverBalafter = await ethers.provider.getBalance(receiver);
      console.log(receiverBalafter, "receiver bal after");
      expect(receiverBalafter).to.eq(receiverBalb4 + amount);
    });
  });
});
