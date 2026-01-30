import {
  BadgeQuestionMark,
  NotebookPen,
  ShieldQuestionMark,
  Coins,
  Wallet,
  ArrowRightLeft,
  Gift,
  Lock,
} from 'lucide-react';

export const features = [
  {
    title: 'Ask A Question',
    icon: BadgeQuestionMark,
  },
  {
    title: 'Answer',
    icon: NotebookPen,
  },
  {
    title: 'Vote',
    icon: ShieldQuestionMark,
  },
  {
    title: 'Earn Tokens',
    icon: Coins,
  },
];

// BRAIN Token Section
export const brainToken = {
  title: 'BRAIN Token',
  subtitle: 'The native utility token powering the BrainBase ecosystem',
  description:
    'BRAIN is an ERC-20 token on Base L2 Ethereum that enables trustless knowledge exchange. It serves as the primary currency for bounties, rewards, and governance. Enjoy ultra-low fees (~$0.01) powered by Base network.',
  features: [
    {
      icon: Gift,
      title: 'Free Faucet',
      description:
        'New users can claim free BRAIN tokens from our faucet to get started immediately.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Easy Swap',
      description: 'Swap ETH or IDRX to BRAIN directly in the platform. Ultra-low fees on Base L2.',
    },
    {
      icon: Lock,
      title: 'Secure Escrow',
      description:
        'Bounties are locked in smart contracts until answers are approved. Fully trustless.',
    },
    {
      icon: Wallet,
      title: 'Your Wallet',
      description: 'Earnings go directly to your wallet. No platform holds your funds.',
    },
  ],
  howItWorks: [
    { step: '1', title: 'Get BRAIN', description: 'Claim from faucet or swap ETH/IDRX' },
    { step: '2', title: 'Ask or Answer', description: 'Attach bounties or provide solutions' },
    { step: '3', title: 'Earn Rewards', description: 'Get paid when answers are approved' },
  ],
};

export const advantages = {
  todaysqna: [
    '❌ Contributors earn nothing - platforms profit from your answers.',
    '❌ No real incentives - upvotes and badges have no monetary value.',
    '❌ Centralized control - platform decides visibility and moderation.',
    '❌ No ownership - your reputation stays locked in one platform.',
  ],
  brainbase: [
    '💰 Earn BRAIN tokens directly to your wallet for accepted answers.',
    '🎁 Free to start - claim tokens from faucet or swap ETH/IDRX instantly.',
    '🔒 Trustless escrow - bounties locked in smart contracts, not our wallet.',
    '📊 On-chain reputation - all contributions verifiable on blockchain.',
  ],
};

export const users = [
  {
    image: '/images/learner-image.png',
    category: 'Learners',
    description: ['Get reliable answers fast', 'Set a bounty to increase visibility'],
  },
  {
    image: '/images/expert-image.png',
    category: 'Experts',
    description: ['Monetize your knowledge', 'Build verifiable reputation'],
  },
];

export const faqs = [
  {
    question: 'What is BRAIN token?',
    answer:
      'BRAIN is the native ERC-20 utility token of BrainBase, built on Base L2 Ethereum. It powers the entire knowledge exchange ecosystem - used for bounties, rewards, and incentivizing quality answers. Enjoy ultra-low transaction fees (~$0.01) on Base network. When you ask a question, you attach BRAIN as a bounty. When your answer is accepted, you earn BRAIN directly to your wallet.',
  },
  {
    question: 'How do bounties work?',
    answer:
      'When you ask a question, you attach a BRAIN bounty (minimum 10 BRAIN). This bounty is locked in a smart contract - not held by BrainBase. Once you approve an answer, the contract automatically releases the bounty to the answerer. The entire flow is trustless and verifiable on-chain.',
  },
  {
    question: 'Do I need crypto experience to use BrainBase?',
    answer:
      'Not at all! Sign in with Google, claim free BRAIN from the faucet, and start asking or answering questions. The complex blockchain stuff happens behind the scenes. For crypto-native users, you can connect your own wallet and track all transactions on-chain.',
  },
  {
    question: 'Which blockchain does BrainBase run on?',
    answer:
      'BrainBase runs on Base network (Chain ID: 84532), an Ethereum L2 by Coinbase. Base offers lightning-fast transactions and ultra-low fees (~$0.01), making micro-bounties practical and affordable. We also support IDRX (Indonesian Rupiah stablecoin) for easy local currency swaps. All bounties, answers, and payouts are recorded on-chain for full transparency.',
  },
  {
    question: 'Is my BRAIN token safe?',
    answer:
      'Yes! BrainBase is non-custodial - we never hold your funds. When you attach a bounty, it goes into a smart contract escrow, not our wallet. Your earnings go directly to your wallet address. You maintain full control of your tokens at all times.',
  },
  {
    question: 'What happens if no one answers my question?',
    answer:
      'If your question expires without an accepted answer, you can refund your bounty back to your wallet. The smart contract ensures your BRAIN tokens are either paid to a helpful answerer or returned to you.',
  },
];

export const testimonials = [
  {
    name: 'Raka Pratama',
    role: 'Backend Developer',
    comment:
      'BrainBase finally gives me a reason to write long, detailed answers. Instead of just farming upvotes, I actually earn BRAIN token when someone accepts my solution.',
    image: '/images/char-1.png',
  },
  {
    name: 'Sarah Lim',
    role: 'Computer Science Student',
    comment:
      'As a student, I love that I can put a small bounty on hard questions and get serious, in-depth answers. It feels like having a global mentor on demand.',
    image: '/images/char-3.png',
  },
  {
    name: 'Diego Martinez',
    role: 'Smart Contract Engineer',
    comment:
      'The fact that all bounties and payouts are on-chain is huge. I can literally show my answer history and earnings as an on-chain portfolio of my expertise.',
    image: '/images/char-2.png',
  },
  {
    name: 'Aulia Rahman',
    role: 'Web3 Community Lead',
    comment:
      'BrainBase fits perfectly into our Discord community. Members ask questions, attach bounties, and we can see transparent payouts instead of vague replies.',
    image: '/images/char-4.png',
  },
  {
    name: 'James Nguyen',
    role: 'Full-Stack Developer',
    comment:
      'The UX feels like a normal Q&A site, but under the hood everything is verifiable. I log in with Google, connect my wallet, and the rest just works.',
    image: '/images/char-5.png',
  },
  {
    name: 'Priya Desai',
    role: 'Data Scientist',
    comment:
      'I have answered niche ML questions that would normally get ignored elsewhere. On BrainBase, those questions come with bounties, so niche knowledge is finally rewarded.',
    image: '/images/char-8.png',
  },
  {
    name: 'Andre Santos',
    role: 'DevOps Engineer',
    comment:
      'What I like most is the trustless settlement. When my answer is accepted, the bounty goes straight to my wallet - no waiting, no negotiation, no hidden platform cuts.',
    image: '/images/char-7.png',
  },
  {
    name: 'Nadia Kusuma',
    role: 'Blockchain Bootcamp Mentor',
    comment:
      'We use BrainBase in our bootcamp as a place where students can post real questions with micro-bounties. It trains them to value good answers and think clearly.',
    image: '/images/char-6.png',
  },
  {
    name: 'Leo Chen',
    role: 'Product Manager',
    comment:
      'BrainBase turns Q&A into a proper knowledge economy. Incentives are clear: ask better questions, give better answers, and everyone can see the value flow on-chain.',
    image: '/images/char-9.png',
  },
  {
    name: 'Maya Al-Hassan',
    role: 'Web3 Content Creator',
    comment:
      'I love that my answers are not just trapped in one platform. With IPFS and on-chain records, my content feels portable, permanent, and truly mine.',
    image: '/images/char-10.png',
  },
];
