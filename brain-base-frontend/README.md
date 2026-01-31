
# 🎨 Frontend (Next.js 15 + OnchainKit)

This folder contains the **frontend application** for BrainBase.
Built with Next.js 15 App Router, OnchainKit for wallet integration, and TailwindCSS for styling.

---

## 📁 Folder Structure

```
brain-base-frontend/
├── app/
│   ├── (auth)/           # Auth pages (sign-in)
│   ├── (home)/           # Main app pages
│   ├── .well-known/      # Farcaster manifest
│   └── layout.tsx
├── components/
│   ├── global/           # Dialogs, modals
│   ├── layout/           # Navbar, sidebar
│   └── ui/               # Shadcn components
├── hooks/                # Custom React hooks
├── lib/
│   ├── providers.tsx     # Wagmi + OnchainKit setup
│   └── chains/           # Chain config
├── services/             # API services
├── stores/               # Zustand stores
├── public/
├── .env                  # Local only (DO NOT commit)
├── .env.example          # Template
└── package.json
```

---

## 📦 Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Coinbase Wallet** or **MetaMask**

---

## 🌱 Environment Variables

### Create `.env`

```bash
cp .env.example .env
```

### `.env` Configuration

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Base Sepolia Contracts
NEXT_PUBLIC_BRAIN_TOKEN_ADDRESS="0x3Cf366603b3eF53DE5C73D58dFEFC9880619D7ec"
NEXT_PUBLIC_MOCK_IDRX_ADDRESS="0x3506Db9a155A3DBc1D726ddB00c14096CA1E28f4"
NEXT_PUBLIC_BRAIN_SWAP_ADDRESS="0x2601385B79c683C40BF366ECB2bf8AdC46a12Fb4"
NEXT_PUBLIC_QNA_CONTRACT_ADDRESS="0x990EEe9119805Fb26559f6A7fb15c3B1416aaaE1"

# OnchainKit (get from https://portal.cdp.coinbase.com)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-api-key"
```

---

## 🚀 How to Run

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

App will be available at: `http://localhost:3000`

---

## 🔗 Wallet Integration

BrainBase uses **OnchainKit** for wallet connectivity:

- **Coinbase Smart Wallet** - Gasless transactions, social recovery
- **MetaMask** - Traditional wallet support

### Wallet Config (lib/providers.tsx)

```tsx
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({ appName: 'BrainBase', preference: 'smartWalletOnly' }),
    metaMask({ dappMetadata: { name: 'BrainBase' } }),
  ],
  transports: { [baseSepolia.id]: http() },
});
```

---

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TailwindCSS | Utility-first CSS |
| OnchainKit | Wallet integration (Coinbase) |
| Wagmi + Viem | Blockchain interactions |
| Zustand | State management |
| Tanstack Query | Data fetching |
| Shadcn/ui | UI components |

---

## 📱 Features

- **Google OAuth** sign-in
- **Wallet Connect** via OnchainKit
- **Q&A with Bounties** - Post questions, earn BRAIN
- **Token Swap** - mIDRX ↔ BRAIN
- **Faucet** - Free tokens for new users
- **Base Mini-App** - Farcaster manifest support

---

## 🧪 Useful Commands

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
```

---

## 🔁 Local Development Order

1. Start backend: `cd ../brain-base-backend && npm run start:dev`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`

---

## � Deployment

Deploy to **Vercel**:

```bash
npm run build
vercel --prod
```

Make sure all `NEXT_PUBLIC_*` environment variables are set in Vercel dashboard.
