# 🧠 BrainBase — Decentralized Q&A with BRAIN Token Bounties

BrainBase is a decentralized Question & Answer platform where users can post questions with a BRAIN token bounty, and answerers compete to earn rewards. Unlike traditional Q&A platforms, BrainBase uses smart contracts as trustless escrow, ensuring transparent payouts without intermediaries. Built on **Base L2** for ultra-low-cost transactions (~$0.01) and powered by our native BRAIN token with mIDRX stablecoin support for Indonesian users. The platform features seamless wallet integration via **OnchainKit** supporting Coinbase Smart Wallet and MetaMask.

Built using **Base Network**, **Solidity**, **Next.js 15**, **NestJS**, and **OnchainKit**.

---

## 🚩 Problem

- High-quality technical answers are hard to incentivize
- Existing Q&A platforms rely on centralized moderation and reputation
- Payments and bounties require trust in a third party
- Contributors are often under-rewarded for expert knowledge
- High platform fees (20-40%) on traditional freelance platforms

---

## 💡 Solution

BrainBase introduces:

- **BRAIN token bounties** locked in smart contracts
- **Trustless payouts** to the selected best answer
- **Asker-based validation** (the asker chooses the winner)
- **mIDRX ↔ BRAIN swap** for stablecoin on/off ramp
- **Ultra-low fees** (~$0.01) via Base L2
- A clean Web3 UX with OnchainKit Smart Wallet integration

---

## 🏗️ System Overview

**Core components:**

- **Smart Contracts** — Escrow BRAIN tokens, manage questions & payouts
- **Frontend** — Next.js 15 dApp with OnchainKit wallet integration
- **Backend** — NestJS API for indexing, caching, and fast queries
- **Base L2** — Ethereum L2 for low-cost, fast transactions

---

## 📦 Repository Structure

```
.
├── brain-base-contract/     # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── BrainToken.sol
│   │   ├── MockIDRX.sol
│   │   ├── BrainSwap.sol
│   │   └── QnAWithBounty.sol
│   ├── script/              # Deployment scripts
│   └── test/                # Contract tests
│
├── brain-base-frontend/     # Next.js 15 dApp
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── hooks/
│
├── brain-base-backend/      # NestJS API
│   ├── src/
│   ├── prisma/
│   └── README.md
│
└── README.md                # Main project overview (this file)
```

---

## 🔗 Blockchain & Network

- **Network:** Base Sepolia (Testnet)
- **Chain ID:** 84532
- **Assets:** BRAIN Token, mIDRX (Mock IDRX Stablecoin)
- **Wallets:** Coinbase Smart Wallet, MetaMask (via OnchainKit)
- **Tooling:** Foundry (Anvil, Forge)

---

## � Smart Contracts (Base Sepolia)

| Contract      | Address                                      | Purpose                                  |
| ------------- | -------------------------------------------- | ---------------------------------------- |
| BrainToken    | `0x3Cf366603b3eF53DE5C73D58dFEFC9880619D7ec` | ERC-20 utility token (1B supply)         |
| MockIDRX      | `0x3506Db9a155A3DBc1D726ddB00c14096CA1E28f4` | Stablecoin with faucet                   |
| BrainSwap     | `0x2601385B79c683C40BF366ECB2bf8AdC46a12Fb4` | mIDRX ↔ BRAIN swap (100M liquidity each) |
| QnAWithBounty | `0x990EEe9119805Fb26559f6A7fb15c3B1416aaaE1` | Bounty escrow & Q&A logic                |

---

## 🔐 Reward Model

- Askers lock **BRAIN token bounty** when posting a question
- Answerers submit answers to compete for the bounty
- **Asker selects the best answer**
- Smart contract releases **100% of the bounty** to the winner
- Platform takes **0% fee** on successful answers

---

## 💱 Token Swap

Users can swap between mIDRX and BRAIN:

- **mIDRX → BRAIN:** 5,000 mIDRX = 1 BRAIN
- **BRAIN → mIDRX:** 1 BRAIN = 5,000 mIDRX
- Free mIDRX faucet for new users (10,000 mIDRX)
- Free BRAIN faucet for new users (10 BRAIN)

---

## 🔒 Security Considerations

- Reentrancy protection on all token transfers
- One-time payout per question
- Strict access control (only asker can resolve)
- Immutable answers once submitted
- ERC-20 approval flow before swaps

> ⚠️ This project is a hackathon prototype and has not undergone a formal security audit.

---

## 🚀 How to Run the Project

### 1️⃣ Smart Contracts

```bash
cd brain-base-contract
anvil
forge build

source .env
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv
```

---

### 2️⃣ Frontend

```bash
cd brain-base-frontend
npm install
npm run dev
```

---

### 3️⃣ Backend

```bash
cd brain-base-backend
npm install
npm run start:dev
```

---

## �️ Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Frontend  | Next.js 15, TailwindCSS, OnchainKit, Wagmi, Viem |
| Backend   | NestJS, PostgreSQL, Prisma, WebSocket            |
| Contracts | Solidity, Foundry                                |
| Network   | Base Sepolia (L2)                                |
| Wallet    | Coinbase Smart Wallet, MetaMask                  |

---

## 🛣️ Future Improvements

- Deploy to Base Mainnet
- Add DAO or community voting
- Introduce reputation-based incentives
- Formal smart contract audit
- Dispute resolution & timeouts
- Real IDRX integration (when available)

---

## 🏁 Hackathon Notes

- Built with simplicity and security in mind
- Focused on **real economic incentives**, not speculation
- Designed for extensibility beyond the hackathon
- Optimized for Indonesian market with mIDRX stablecoin support
