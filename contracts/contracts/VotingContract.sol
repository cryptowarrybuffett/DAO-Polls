// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Base Voting dApp
/// @notice On-chain Yes/No polling. Any wallet can create polls and vote.
/// @dev Optimized for gas: struct packing, custom errors, unchecked increments.
contract VotingContract {
    // -----------------------------------------------------------------------
    // Custom errors (cheaper than require strings)
    // -----------------------------------------------------------------------

    error PollDoesNotExist();
    error PollExpired();
    error PollStillActive();
    error AlreadyVoted();
    error InvalidDuration();
    error EmptyTitle();

    // -----------------------------------------------------------------------
    // Data structures
    // -----------------------------------------------------------------------

    /// @dev Struct is packed to minimize storage slots.
    ///  Slot 1: creator (20) + endTime (5) + exists (1) = 26 bytes
    ///  Slot 2: yesVotes (16) + noVotes (16) = 32 bytes
    ///  Slots 3+: title and description (dynamic)
    struct Poll {
        address creator;
        uint40 endTime;
        bool exists;
        uint128 yesVotes;
        uint128 noVotes;
        string title;
        string description;
    }

    // -----------------------------------------------------------------------
    // State variables
    // -----------------------------------------------------------------------

    /// @notice Total number of polls created
    uint256 public pollCount;

    /// @notice Poll ID => Poll data
    mapping(uint256 => Poll) public polls;

    /// @notice Poll ID => voter address => whether they have voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /// @notice Poll ID => voter address => vote choice (true = Yes, false = No)
    mapping(uint256 => mapping(address => bool)) public voteChoice;

    /// @notice Poll ID => ordered list of voter addresses
    mapping(uint256 => address[]) private _pollVoters;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string title,
        uint40 endTime
    );

    event VoteCast(
        uint256 indexed pollId,
        address indexed voter,
        bool voteYes
    );

    // -----------------------------------------------------------------------
    // External / public functions
    // -----------------------------------------------------------------------

    /// @notice Create a new Yes/No poll.
    /// @param _title    Poll title (must be non-empty).
    /// @param _description Poll description.
    /// @param _duration Voting window in seconds from now.
    /// @return pollId   The ID of the newly created poll.
    function createPoll(
        string calldata _title,
        string calldata _description,
        uint40 _duration
    ) external returns (uint256 pollId) {
        if (bytes(_title).length == 0) revert EmptyTitle();
        if (_duration == 0) revert InvalidDuration();

        uint40 endTime = uint40(block.timestamp) + _duration;

        pollId = pollCount;
        // Safe to use unchecked: pollCount cannot overflow uint256 in practice
        unchecked {
            pollCount++;
        }

        Poll storage p = polls[pollId];
        p.creator = msg.sender;
        p.endTime = endTime;
        p.exists = true;
        p.title = _title;
        p.description = _description;
        // yesVotes and noVotes default to 0

        emit PollCreated(pollId, msg.sender, _title, endTime);
    }

    /// @notice Cast a Yes or No vote on an active poll.
    /// @param _pollId  The poll to vote on.
    /// @param _voteYes true for Yes, false for No.
    function vote(uint256 _pollId, bool _voteYes) external {
        Poll storage p = polls[_pollId];

        if (!p.exists) revert PollDoesNotExist();
        if (block.timestamp >= p.endTime) revert PollExpired();
        if (hasVoted[_pollId][msg.sender]) revert AlreadyVoted();

        // Record the vote
        hasVoted[_pollId][msg.sender] = true;
        voteChoice[_pollId][msg.sender] = _voteYes;
        _pollVoters[_pollId].push(msg.sender);

        // Tally - safe to use unchecked: uint128 overflow is practically impossible
        unchecked {
            if (_voteYes) {
                p.yesVotes++;
            } else {
                p.noVotes++;
            }
        }

        emit VoteCast(_pollId, msg.sender, _voteYes);
    }

    // -----------------------------------------------------------------------
    // View functions
    // -----------------------------------------------------------------------

    /// @notice Get full data for a poll.
    /// @param _pollId The poll ID.
    /// @return The Poll struct.
    function getPoll(uint256 _pollId) external view returns (Poll memory) {
        if (!polls[_pollId].exists) revert PollDoesNotExist();
        return polls[_pollId];
    }

    /// @notice Get the list of addresses that voted on a poll.
    /// @param _pollId The poll ID.
    /// @return Array of voter addresses.
    function getVoters(uint256 _pollId) external view returns (address[] memory) {
        return _pollVoters[_pollId];
    }

    /// @notice Get the total number of polls.
    /// @return The poll count.
    function getPollCount() external view returns (uint256) {
        return pollCount;
    }

    /// @notice Check whether a specific address voted on a poll and their choice.
    /// @param _pollId The poll ID.
    /// @param _voter  The address to check.
    /// @return voted  Whether the address has voted.
    /// @return choice true = Yes, false = No (only meaningful if voted is true).
    function getVoterChoice(
        uint256 _pollId,
        address _voter
    ) external view returns (bool voted, bool choice) {
        voted = hasVoted[_pollId][_voter];
        choice = voteChoice[_pollId][_voter];
    }
}
