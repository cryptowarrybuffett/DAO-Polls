import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { VotingContract } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingContract", function () {
  const ONE_HOUR = 3600;
  const ONE_DAY = 86400;

  async function deployFixture() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("VotingContract");
    const voting = await VotingFactory.deploy();
    return { voting, owner, voter1, voter2, voter3 };
  }

  async function deployWithPollFixture() {
    const { voting, owner, voter1, voter2, voter3 } = await loadFixture(
      deployFixture
    );
    await voting.createPoll("Test Poll", "A test description", ONE_DAY);
    return { voting, owner, voter1, voter2, voter3 };
  }

  // -------------------------------------------------------------------
  // Ownership
  // -------------------------------------------------------------------

  describe("Ownership", function () {
    it("should set deployer as owner", async function () {
      const { voting, owner } = await loadFixture(deployFixture);
      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  // -------------------------------------------------------------------
  // Poll Creation
  // -------------------------------------------------------------------

  describe("Poll Creation", function () {
    it("should create a poll with correct parameters", async function () {
      const { voting, owner } = await loadFixture(deployFixture);

      await voting.createPoll("My Poll", "My Description", ONE_DAY);

      const poll = await voting.getPoll(0);
      expect(poll.title).to.equal("My Poll");
      expect(poll.description).to.equal("My Description");
      expect(poll.creator).to.equal(owner.address);
      expect(poll.exists).to.be.true;
      expect(poll.isPaused).to.be.false;
      expect(poll.yesVotes).to.equal(0);
      expect(poll.noVotes).to.equal(0);
    });

    it("should increment pollCount after creation", async function () {
      const { voting } = await loadFixture(deployFixture);

      expect(await voting.getPollCount()).to.equal(0);
      await voting.createPoll("Poll 1", "Desc 1", ONE_DAY);
      expect(await voting.getPollCount()).to.equal(1);
      await voting.createPoll("Poll 2", "Desc 2", ONE_DAY);
      expect(await voting.getPollCount()).to.equal(2);
    });

    it("should emit PollCreated event with correct args", async function () {
      const { voting, owner } = await loadFixture(deployFixture);

      const tx = voting.createPoll("Event Poll", "Desc", ONE_HOUR);
      await expect(tx)
        .to.emit(voting, "PollCreated")
        .withArgs(0, owner.address, "Event Poll", (endTime: bigint) => {
          return endTime > 0n;
        });
    });

    it("should revert with zero duration", async function () {
      const { voting } = await loadFixture(deployFixture);

      await expect(
        voting.createPoll("Poll", "Desc", 0)
      ).to.be.revertedWithCustomError(voting, "InvalidDuration");
    });

    it("should revert with empty title", async function () {
      const { voting } = await loadFixture(deployFixture);

      await expect(
        voting.createPoll("", "Desc", ONE_DAY)
      ).to.be.revertedWithCustomError(voting, "EmptyTitle");
    });
  });

  // -------------------------------------------------------------------
  // Voting
  // -------------------------------------------------------------------

  describe("Voting", function () {
    it("should allow a user to vote Yes", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.connect(voter1).vote(0, true);

      const poll = await voting.getPoll(0);
      expect(poll.yesVotes).to.equal(1);
      expect(poll.noVotes).to.equal(0);
    });

    it("should allow a user to vote No", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.connect(voter1).vote(0, false);

      const poll = await voting.getPoll(0);
      expect(poll.yesVotes).to.equal(0);
      expect(poll.noVotes).to.equal(1);
    });

    it("should record voter's choice correctly", async function () {
      const { voting, voter1, voter2 } = await loadFixture(
        deployWithPollFixture
      );

      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter2).vote(0, false);

      const [voted1, choice1] = await voting.getVoterChoice(
        0,
        voter1.address
      );
      expect(voted1).to.be.true;
      expect(choice1).to.be.true;

      const [voted2, choice2] = await voting.getVoterChoice(
        0,
        voter2.address
      );
      expect(voted2).to.be.true;
      expect(choice2).to.be.false;
    });

    it("should add voter to pollVoters array", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.connect(voter1).vote(0, true);

      const voters = await voting.getVoters(0);
      expect(voters).to.have.lengthOf(1);
      expect(voters[0]).to.equal(voter1.address);
    });

    it("should emit VoteCast event with correct args", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await expect(voting.connect(voter1).vote(0, true))
        .to.emit(voting, "VoteCast")
        .withArgs(0, voter1.address, true);
    });

    it("should allow multiple different users to vote", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(
        deployWithPollFixture
      );

      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter2).vote(0, false);
      await voting.connect(voter3).vote(0, true);

      const poll = await voting.getPoll(0);
      expect(poll.yesVotes).to.equal(2);
      expect(poll.noVotes).to.equal(1);
    });

    it("should correctly tally mixed Yes/No votes", async function () {
      const { voting, owner, voter1, voter2, voter3 } = await loadFixture(
        deployWithPollFixture
      );

      // 3 Yes + 2 No
      await voting.connect(owner).vote(0, true);
      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter2).vote(0, true);
      await voting.connect(voter3).vote(0, false);

      const poll = await voting.getPoll(0);
      expect(poll.yesVotes).to.equal(3);
      expect(poll.noVotes).to.equal(1);

      const voters = await voting.getVoters(0);
      expect(voters).to.have.lengthOf(4);
    });
  });

  // -------------------------------------------------------------------
  // Double Vote Prevention
  // -------------------------------------------------------------------

  describe("Double Vote Prevention", function () {
    it("should revert if user tries to vote twice on same poll", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.connect(voter1).vote(0, true);

      await expect(
        voting.connect(voter1).vote(0, false)
      ).to.be.revertedWithCustomError(voting, "AlreadyVoted");
    });

    it("should allow user to vote on different polls", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      // Create a second poll
      await voting.createPoll("Poll 2", "Desc 2", ONE_DAY);

      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter1).vote(1, false);

      const poll0 = await voting.getPoll(0);
      const poll1 = await voting.getPoll(1);
      expect(poll0.yesVotes).to.equal(1);
      expect(poll1.noVotes).to.equal(1);
    });
  });

  // -------------------------------------------------------------------
  // Deadline Enforcement
  // -------------------------------------------------------------------

  describe("Deadline Enforcement", function () {
    it("should revert if voting after poll deadline", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      // Advance time past the deadline
      await time.increase(ONE_DAY + 1);

      await expect(
        voting.connect(voter1).vote(0, true)
      ).to.be.revertedWithCustomError(voting, "PollExpired");
    });

    it("should allow voting right before deadline", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      // Advance to just before the deadline
      await time.increase(ONE_DAY - 10);

      await expect(voting.connect(voter1).vote(0, true)).to.not.be.reverted;
    });
  });

  // -------------------------------------------------------------------
  // Pause / Unpause (Admin)
  // -------------------------------------------------------------------

  describe("Pause / Unpause", function () {
    it("should allow owner to pause a poll", async function () {
      const { voting } = await loadFixture(deployWithPollFixture);

      await expect(voting.pausePoll(0))
        .to.emit(voting, "PollPaused")
        .withArgs(0, true);

      const poll = await voting.getPoll(0);
      expect(poll.isPaused).to.be.true;
    });

    it("should allow owner to unpause a poll", async function () {
      const { voting } = await loadFixture(deployWithPollFixture);

      await voting.pausePoll(0);
      await expect(voting.unpausePoll(0))
        .to.emit(voting, "PollPaused")
        .withArgs(0, false);

      const poll = await voting.getPoll(0);
      expect(poll.isPaused).to.be.false;
    });

    it("should revert pausePoll for non-owner", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await expect(
        voting.connect(voter1).pausePoll(0)
      ).to.be.revertedWithCustomError(voting, "NotOwner");
    });

    it("should revert unpausePoll for non-owner", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.pausePoll(0);

      await expect(
        voting.connect(voter1).unpausePoll(0)
      ).to.be.revertedWithCustomError(voting, "NotOwner");
    });

    it("should revert vote on paused poll", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.pausePoll(0);

      await expect(
        voting.connect(voter1).vote(0, true)
      ).to.be.revertedWithCustomError(voting, "PollIsPaused");
    });

    it("should allow voting after unpause", async function () {
      const { voting, voter1 } = await loadFixture(deployWithPollFixture);

      await voting.pausePoll(0);
      await voting.unpausePoll(0);

      await expect(voting.connect(voter1).vote(0, true)).to.not.be.reverted;

      const poll = await voting.getPoll(0);
      expect(poll.yesVotes).to.equal(1);
    });

    it("should revert pausePoll for non-existent poll", async function () {
      const { voting } = await loadFixture(deployFixture);

      await expect(
        voting.pausePoll(999)
      ).to.be.revertedWithCustomError(voting, "PollDoesNotExist");
    });

    it("should return isPaused in getPoll", async function () {
      const { voting } = await loadFixture(deployWithPollFixture);

      let poll = await voting.getPoll(0);
      expect(poll.isPaused).to.be.false;

      await voting.pausePoll(0);
      poll = await voting.getPoll(0);
      expect(poll.isPaused).to.be.true;
    });
  });

  // -------------------------------------------------------------------
  // View Functions
  // -------------------------------------------------------------------

  describe("View Functions", function () {
    it("should return correct poll data via getPoll", async function () {
      const { voting, owner } = await loadFixture(deployWithPollFixture);

      const poll = await voting.getPoll(0);
      expect(poll.title).to.equal("Test Poll");
      expect(poll.description).to.equal("A test description");
      expect(poll.creator).to.equal(owner.address);
      expect(poll.exists).to.be.true;
      expect(poll.isPaused).to.be.false;
      expect(poll.yesVotes).to.equal(0);
      expect(poll.noVotes).to.equal(0);
      expect(poll.endTime).to.be.greaterThan(0);
    });

    it("should return correct voter list via getVoters", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(
        deployWithPollFixture
      );

      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter2).vote(0, false);
      await voting.connect(voter3).vote(0, true);

      const voters = await voting.getVoters(0);
      expect(voters).to.have.lengthOf(3);
      expect(voters[0]).to.equal(voter1.address);
      expect(voters[1]).to.equal(voter2.address);
      expect(voters[2]).to.equal(voter3.address);
    });

    it("should return correct pollCount", async function () {
      const { voting } = await loadFixture(deployFixture);

      await voting.createPoll("A", "a", ONE_HOUR);
      await voting.createPoll("B", "b", ONE_HOUR);
      await voting.createPoll("C", "c", ONE_HOUR);

      expect(await voting.getPollCount()).to.equal(3);
    });

    it("should revert getPoll for non-existent poll", async function () {
      const { voting } = await loadFixture(deployFixture);

      await expect(voting.getPoll(999)).to.be.revertedWithCustomError(
        voting,
        "PollDoesNotExist"
      );
    });
  });

  // -------------------------------------------------------------------
  // Edge Cases
  // -------------------------------------------------------------------

  describe("Edge Cases", function () {
    it("should handle polls with very long titles/descriptions", async function () {
      const { voting } = await loadFixture(deployFixture);

      const longTitle = "A".repeat(500);
      const longDesc = "B".repeat(1000);

      await voting.createPoll(longTitle, longDesc, ONE_DAY);

      const poll = await voting.getPoll(0);
      expect(poll.title).to.equal(longTitle);
      expect(poll.description).to.equal(longDesc);
    });

    it("should handle the first poll (ID 0) correctly", async function () {
      const { voting, owner } = await loadFixture(deployFixture);

      await voting.createPoll("First", "The first poll", ONE_HOUR);

      const poll = await voting.getPoll(0);
      expect(poll.title).to.equal("First");
      expect(poll.creator).to.equal(owner.address);
    });

    it("should handle concurrent polls independently", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployFixture);

      await voting.createPoll("Poll A", "Desc A", ONE_DAY);
      await voting.createPoll("Poll B", "Desc B", ONE_DAY);

      // Vote differently on each
      await voting.connect(voter1).vote(0, true);
      await voting.connect(voter1).vote(1, false);
      await voting.connect(voter2).vote(0, false);
      await voting.connect(voter2).vote(1, true);

      const pollA = await voting.getPoll(0);
      const pollB = await voting.getPoll(1);

      expect(pollA.yesVotes).to.equal(1);
      expect(pollA.noVotes).to.equal(1);
      expect(pollB.yesVotes).to.equal(1);
      expect(pollB.noVotes).to.equal(1);

      // Voters are tracked independently
      const votersA = await voting.getVoters(0);
      const votersB = await voting.getVoters(1);
      expect(votersA).to.have.lengthOf(2);
      expect(votersB).to.have.lengthOf(2);
    });

    it("should revert vote on non-existent poll", async function () {
      const { voting, voter1 } = await loadFixture(deployFixture);

      await expect(
        voting.connect(voter1).vote(999, true)
      ).to.be.revertedWithCustomError(voting, "PollDoesNotExist");
    });
  });
});
