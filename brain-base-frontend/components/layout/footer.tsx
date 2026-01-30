import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="relative z-10 shadow-sm bg-primary text-white bottom-0! p-6 ">
      <div className="flex flex-col justify-center items-center gap-4">
        <Link href={'/'}>
          <Image
            src="/images/brainbase-logo-white-b.png"
            alt="brainbase-logo-white"
            width={40}
            height={40}
          />
        </Link>
        <p className="text-sm font-normal text-center">
          &copy; 2025 Made by Lunarion. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
