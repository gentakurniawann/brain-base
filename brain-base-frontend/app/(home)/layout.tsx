'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

import useAuth from '@/stores/auth';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <div className="absolute w-full h-full overflow-hidden">
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute top-[48px] ${
            pathname === '/' ? 'left-[-265px]' : 'right-[-265px]'
          } gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute top-[-188px] ${
            pathname === '/' ? 'left-[161px]' : 'right-[161px]'
          } gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute top-[-188px] ${
            pathname === '/' ? 'left-[-124px]' : 'right-[-124px]'
          } gradient-animation`}
        />
        {pathname === '/' && (
          <div>
            <div>
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute top-[879px] right-[-378px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute top-[643px] right-[48px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute top-[643px] right-[-237px] gradient-animation`}
              />
            </div>
            <div>
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute top-[1821px] left-[-201px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute top-[1585px] left-[225px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute top-[1585px] left-[-60px] gradient-animation`}
              />
            </div>
            <div>
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute top-[2867px] right-[231px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute top-[2631px] right-[-195px] gradient-animation`}
              />
              <div
                className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute top-[2631px] right-[90px] gradient-animation`}
              />
            </div>
          </div>
        )}
      </div>
      <Navbar />
      <main
        className={`min-h-screen p-2 sm:p-6 lg:p-12 ${!token && pathname === '/' ? '!pb-0' : ''} relative z-10 !text-blue-950 pt-24 sm:pt-28 lg:pt-32 max-w-[1440px] mx-auto`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
