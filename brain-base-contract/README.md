# 🧠 Smart Contracts (Foundry)

This folder contains the **smart contract layer** for BrainBase, built using **Foundry**.
It includes contract source code, deployment scripts, and tests.

---

## 📁 Folder Structure

```
brain-base-contract/
├── src/
│   └── core/
│       ├── BrainToken.sol       # ERC-20 BRAIN token
│       ├── MockIDRX.sol         # Mock IDRX stablecoin
│       ├── BrainSwap.sol        # Token swap contract
│       └── QnAWithBounty.sol    # Q&A bounty escrow
├── script/
│   └── Deploy.s.sol             # Deployment script
├── test/                        # Contract tests
├── foundry.toml
├── .env                         # Local only (DO NOT commit)
├── .env.example                 # Template
└── README.md
```

---

## 📦 Prerequisites

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify:

```bash
forge --version
anvil --version
cast --version
```

---

## 🌱 Environment Variables

### Create `.env`

```bash
cp .env.example .env
```

### `.env` for Base Sepolia

```env
# Base Sepolia
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532

# Deployer private key
PRIVATE_KEY=0x...

# (Optional) BaseScan verification
ETHERSCAN_API_KEY=
```

---

## 📜 Smart Contracts

| Contract      | Address (Base Sepolia)                       | Purpose                          |
| ------------- | -------------------------------------------- | -------------------------------- |
| BrainToken    | `0x3Cf366603b3eF53DE5C73D58dFEFC9880619D7ec` | ERC-20 utility token (1B supply) |
| MockIDRX      | `0x3506Db9a155A3DBc1D726ddB00c14096CA1E28f4` | Stablecoin with faucet           |
| BrainSwap     | `0x2601385B79c683C40BF366ECB2bf8AdC46a12Fb4` | mIDRX ↔ BRAIN swap               |
| QnAWithBounty | `0x990EEe9119805Fb26559f6A7fb15c3B1416aaaE1` | Bounty escrow & Q&A logic        |

---

## 🚀 Build & Deploy

### 1️⃣ Compile Contracts

```bash
forge build
```

### 2️⃣ Run Tests

```bash
forge test
```

### 3️⃣ Deploy to Base Sepolia

```bash
source .env

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv
```

---

## 🔧 Contract Details

### BrainToken.sol

- ERC-20 token with 1 billion total supply
- Used for bounty payments

### MockIDRX.sol

- Mock IDRX stablecoin
- Includes `faucet()` function for free tokens
- One-time claim of 10,000 mIDRX per address

### BrainSwap.sol

- AMM-style swap between mIDRX and BRAIN
- Swap rates:
  - mIDRX → BRAIN: 5,000 mIDRX = 1 BRAIN
  - BRAIN → mIDRX: 1 BRAIN = 5,000 mIDRX
- 100M liquidity for each token

### QnAWithBounty.sol

- Question creation with BRAIN bounty escrow
- Answer submission and storage
- Verified answer selection by question author
- Automatic bounty payout to winner

---

## 🧪 Useful Commands

```bash
forge build           # Compile contracts
forge test            # Run tests
forge test -vvvv      # Verbose test output
forge fmt             # Format code
forge snapshot        # Gas snapshots
```

---

## ⚠️ Important Notes

- Never commit `.env` or expose private keys
- Base Sepolia faucet: https://www.coinbase.com/faucets/base-sepolia
- Contract verification on BaseScan requires `ETHERSCAN_API_KEY`
