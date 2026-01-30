import type { Metadata } from 'next';
import { Inter, Audiowide } from 'next/font/google';

import RootProviders from '@/lib/providers';
import './globals.css';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const audiowide = Audiowide({
  variable: '--font-audiowide',
  display: 'swap',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'BrainBase',
  description: 'Get Answers. Earn Tokens. Own Your Reputation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter.variable} ${audiowide.variable} ${audiowide.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div className="w-screen h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <RootProviders>
            <div>{children}</div>
          </RootProviders>
        </Suspense>
      </body>
    </html>
  );
}
