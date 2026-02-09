export const VOTING_CONTRACT_ABI = [
  { inputs: [], name: "AlreadyVoted", type: "error" },
  { inputs: [], name: "EmptyTitle", type: "error" },
  { inputs: [], name: "InvalidDuration", type: "error" },
  { inputs: [], name: "PollDoesNotExist", type: "error" },
  { inputs: [], name: "PollExpired", type: "error" },
  { inputs: [], name: "PollStillActive", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "pollId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "uint40", name: "endTime", type: "uint40" },
    ],
    name: "PollCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "pollId", type: "uint256" },
      { indexed: true, internalType: "address", name: "voter", type: "address" },
      { indexed: false, internalType: "bool", name: "voteYes", type: "bool" },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "uint40", name: "_duration", type: "uint40" },
    ],
    name: "createPoll",
    outputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_pollId", type: "uint256" }],
    name: "getPoll",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint40", name: "endTime", type: "uint40" },
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "uint128", name: "yesVotes", type: "uint128" },
          { internalType: "uint128", name: "noVotes", type: "uint128" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
        ],
        internalType: "struct VotingContract.Poll",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPollCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_pollId", type: "uint256" },
      { internalType: "address", name: "_voter", type: "address" },
    ],
    name: "getVoterChoice",
    outputs: [
      { internalType: "bool", name: "voted", type: "bool" },
      { internalType: "bool", name: "choice", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_pollId", type: "uint256" }],
    name: "getVoters",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_pollId", type: "uint256" },
      { internalType: "bool", name: "_voteYes", type: "bool" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const VOTING_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  84532: (process.env.NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000",
  8453: (process.env.NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000",
};
