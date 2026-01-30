import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://braintheria.vercel.app';

  const manifest = {
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    miniapp: {
      version: '1',
      name: 'Braintheria',
      homeUrl: appUrl,
      iconUrl: `${appUrl}/images/brain-icon.png`,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#1a1a2e',
      webhookUrl: `${appUrl}/api/webhook`,
      subtitle: 'Earn crypto for knowledge sharing',
      description:
        'A decentralized Q&A platform where you earn BRAIN tokens for answering questions. Powered by Base L2 with ultra-low fees (~$0.01) and IDRX stablecoin support for Indonesian users.',
      screenshotUrls: [
        `${appUrl}/images/screenshot-1.png`,
        `${appUrl}/images/screenshot-2.png`,
        `${appUrl}/images/screenshot-3.png`,
      ],
      primaryCategory: 'social',
      tags: ['defi', 'social', 'education', 'base', 'idrx', 'knowledge', 'bounty'],
      heroImageUrl: `${appUrl}/images/hero.png`,
      tagline: 'Ask. Answer. Earn.',
      ogTitle: 'Braintheria - Earn Crypto for Knowledge',
      ogDescription:
        'Decentralized Q&A with BRAIN token bounties on Base L2. Support for ETH and IDRX swaps.',
      ogImageUrl: `${appUrl}/images/og-image.png`,
      noindex: false,
    },
  };

  return NextResponse.json(manifest);
}
