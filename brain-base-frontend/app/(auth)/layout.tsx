import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="absolute w-full h-full overflow-hidden">
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute top-[48px] right-[-265px] gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute top-[-188px] right-[161px] gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute top-[-188px] right-[-124px] gradient-animation`}
        />
      </div>
      <div className="absolute w-full h-full overflow-hidden">
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-300 absolute bottom-[48px] left-[-265px] gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-400 absolute bottom-[-188px] left-[161px] gradient-animation`}
        />
        <div
          className={`rounded-full w-[29.5vw] h-[29.5vw] min-w-[213px] min-h-[213px] max-w-[426px] max-h-[426px] blur-[150px] bg-blue-500 absolute bottom-[-188px] left-[-124px] gradient-animation`}
        />
      </div>
      <main className="min-h-screen h-full w-full relative !text-blue-950">
        <div className="w-full h-full min-h-screen backdrop-blur-sm absolute top-0 left-0"></div>
        <div className="w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
          {children}
        </div>
      </main>
    </>
  );
}
