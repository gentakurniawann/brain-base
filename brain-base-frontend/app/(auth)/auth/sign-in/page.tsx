'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import useAuth from '@/stores/auth';
import useTheme from '@/stores/theme';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const { setToken, setUserCredential } = useAuth();
  const { setLoading } = useTheme();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      handleTokenCallback(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTokenCallback = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // store token in zustand and cookies
      setToken(token);
      // fetch user data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUserCredential(userData);

      // redirect
      router.push('/');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      // clear on error
      Cookies.remove('token');
      Cookies.remove('user');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}auth/google`;
  };

  return (
    <div className="h-full rounded-3xl flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative w-full max-w-sm p-8 z-10 glass-background rounded-2xl shadow-lg"
      >
        <div className="flex flex-col items-center gap-4 mb-4">
          <Image
            src="/images/brainbase-logo-b.png"
            alt="brainbase-logo"
            width={32}
            height={32}
          />
          <h2 className="text-2xl font-bold text-blue-950">Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in with your Google account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
          >
            <p className="text-sm text-red-800 dark:text-red-300 text-center">{error}</p>
          </motion.div>
        )}

        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          size={'lg'}
          className="w-full"
        >
          <Image
            src="/images/google-image.png"
            alt="google-image"
            width={24}
            height={24}
            className="mr-2"
          />
          Continue with Google
        </Button>
      </motion.div>
    </div>
  );
}
