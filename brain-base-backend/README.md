# 🧩 BrainBase Backend (NestJS)

This folder contains the **backend API** for BrainBase.
It handles:

- Auth (JWT + Google OAuth)
- Database access (PostgreSQL via Prisma)
- Smart contract integration (Base Sepolia RPC + contract ABIs)
- Faucet & Swap services for BRAIN and mIDRX tokens

---

## 📁 Structure

```
brain-base-backend/
├── src/
│   ├── auth/              # Google OAuth + JWT
│   ├── users/             # User management
│   ├── questions/         # Q&A CRUD
│   ├── answers/           # Answer management
│   ├── bounties/          # Bounty claim logic
│   ├── faucet-swap/       # Token faucet & swap
│   ├── chain/             # Blockchain integration
│   │   ├── signer.service.ts
│   │   ├── faucet-swap.service.ts
│   │   ├── brain.abi.ts
│   │   └── qna.abi.ts
│   └── app.module.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env                   # Local only (DO NOT commit)
├── .env.example           # Template (commit this)
├── package.json
└── README.md
```

---

## 📦 Prerequisites

You need:

- Node.js >= 18
- PostgreSQL running locally or hosted
- (Optional) Deployed contracts on Base Sepolia

---

## 🌱 Environment Variables

### 1) Create `.env`

```bash
cp .env.example .env
```

### 2) Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/brainbase"

# Auth
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Base Sepolia RPC
RPC_URL="https://sepolia.base.org"

# Contract Addresses (Base Sepolia)
BRAIN_TOKEN_ADDRESS="0x3Cf366603b3eF53DE5C73D58dFEFC9880619D7ec"
MOCK_IDRX_ADDRESS="0x3506Db9a155A3DBc1D726ddB00c14096CA1E28f4"
BRAIN_SWAP_ADDRESS="0x2601385B79c683C40BF366ECB2bf8AdC46a12Fb4"
QNA_CONTRACT_ADDRESS="0x990EEe9119805Fb26559f6A7fb15c3B1416aaaE1"

# Server Signer (for backend transactions)
SERVER_SIGNER_PRIVATE_KEY="0x..."
```

> ⚠️ Never commit `.env` or expose private keys publicly.

---

## 🗄️ Database Setup (PostgreSQL + Prisma)

### 1) Install dependencies

```bash
npm install
```

### 2) Generate Prisma client

```bash
npx prisma generate
```

### 3) Run migrations

```bash
npx prisma migrate dev
```

### 4) (Optional) Prisma Studio

```bash
npx prisma studio
```

---

## ⛓️ Blockchain Integration

The backend interacts with smart contracts on **Base Sepolia**:

| Contract      | Purpose                           |
| ------------- | --------------------------------- |
| BrainToken    | ERC-20 token transfers            |
| MockIDRX      | Stablecoin faucet                 |
| BrainSwap     | Token swap rates & liquidity      |
| QnAWithBounty | Question/Answer/Bounty management |

### Contract ABIs

ABIs are stored in `src/chain/`:

- `brain.abi.ts` - BrainSwap ABI
- `qna.abi.ts` - QnAWithBounty ABI

### Server Signer

The backend uses a server signer to execute on-chain transactions:

- Faucet claims (BRAIN & mIDRX)
- Answer submissions
- Bounty distributions

---

## 🚀 Run Backend Locally

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod
```

Backend runs on: `http://localhost:3001`

---

## 🔐 Auth Notes

### Google OAuth Callback

Make sure Google OAuth console callback matches:

```
http://localhost:3001/auth/google/callback
```

For production:

```
https://your-backend-url.com/auth/google/callback
```

### Frontend URL

Set `FRONTEND_URL` for CORS and auth redirects:

```env
FRONTEND_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Auth

- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user

### Questions

- `GET /questions` - List questions
- `POST /questions` - Create question (requires auth)
- `GET /questions/:id` - Get question detail

### Answers

- `POST /answers` - Submit answer
- `GET /answers/question/:id` - Get answers for question

### Faucet & Swap

- `GET /faucet-swap/info` - Get swap rates & balances
- `POST /faucet-swap/claim-brain` - Claim free BRAIN
- `POST /faucet-swap/claim-idrx` - Claim free mIDRX

### Bounties

- `POST /bounties/claim` - Claim bounty for verified answer

---

## ✅ Full-Stack Local Setup Order

1. Start PostgreSQL
2. Update backend `.env` with database URL
3. Run `npx prisma migrate dev`
4. Run backend: `npm run start:dev`
5. Run frontend: `cd ../brain-base-frontend && npm run dev`

---

## 🚢 Deployment

Backend can be deployed to:

- **Vercel** (Serverless)
- **Railway**
- **Render**
- **AWS/GCP/Azure**

Make sure to set all environment variables in your hosting platform.
