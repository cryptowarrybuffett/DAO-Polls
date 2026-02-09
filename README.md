# Base Voting dApp

On-chain Yes/No polling on Base blockchain. Any wallet can create polls and vote, with full transparency of voter addresses and choices.

## Tech Stack

- **Smart Contract**: Solidity 0.8.28, Hardhat 2.x
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **Web3**: RainbowKit, wagmi v2, viem
- **Networks**: Base Sepolia (testnet), Base Mainnet

## Project Structure

```
contracts/          # Hardhat project (smart contract, tests, deployment)
frontend/           # Next.js frontend (UI, wallet connection, contract interaction)
```

## Prerequisites

- Node.js 18+
- npm
- A wallet (MetaMask, Coinbase Wallet, etc.)
- Base Sepolia ETH for testnet (get from a faucet)
- WalletConnect project ID from https://cloud.walletconnect.com

## Setup

### 1. Smart Contract

```bash
cd contracts
cp .env.example .env
# Edit .env with your deployer private key and API keys
npm install
```

Run tests:

```bash
npx hardhat test
```

### 2. Deploy to Base Sepolia

Get testnet ETH from a Base Sepolia faucet, then deploy:

```bash
npx hardhat ignition deploy ignition/modules/VotingContract.ts --network baseSepolia --verify
```

The deployed address will be printed and saved in `ignition/deployments/`.

### 3. Deploy to Base Mainnet

```bash
npx hardhat ignition deploy ignition/modules/VotingContract.ts --network base --verify
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
#   NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS=0x_deployed_address
#   NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS=0x_deployed_address
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- **Wallet Connection**: MetaMask, Coinbase Wallet, WalletConnect via RainbowKit
- **Network Detection**: Warns and prompts to switch if not on Base
- **Create Polls**: Title, description, configurable duration (hours/days/weeks)
- **Vote**: Yes/No on-chain voting with double-vote prevention
- **Results**: Live vote counts with percentage bars
- **Transparency**: View all voter addresses and their choices
- **Transaction Tracking**: Real-time TX status with block explorer links

## Smart Contract

`VotingContract.sol` - Permissionless on-chain voting:

- Gas-optimized struct packing (uint40 timestamps, uint128 vote counts)
- Custom errors instead of require strings
- Events: `PollCreated`, `VoteCast`
- Prevents double voting and voting after deadline
- 24 passing tests

## Environment Variables

### contracts/.env

| Variable | Description |
|---|---|
| `DEPLOYER_PRIVATE_KEY` | Private key for deployment |
| `ETHERSCAN_API_KEY` | Basescan API key for verification |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia RPC (default: https://sepolia.base.org) |
| `BASE_MAINNET_RPC_URL` | Base Mainnet RPC (default: https://mainnet.base.org) |

### frontend/.env.local

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |
| `NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS` | Deployed contract address on Base Sepolia |
| `NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS` | Deployed contract address on Base Mainnet |
