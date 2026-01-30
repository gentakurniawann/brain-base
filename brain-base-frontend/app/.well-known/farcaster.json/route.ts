import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brain-base-fe.vercel.app';

  const manifest = {
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'BrainBase',
      homeUrl: appUrl,
      iconUrl: `${appUrl}/images/brainbase-logo-b.png`,
      splashImageUrl: `${appUrl}/images/brainbase-logo-b.png`,
      splashBackgroundColor: '#0A0A0A',
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return NextResponse.json(manifest);
}
