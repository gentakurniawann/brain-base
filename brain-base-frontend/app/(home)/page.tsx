'use client';
import useAuth from '@/stores/auth';

import LandingPage from '@/components/menu/home/landing-page';
import Dashboard from '@/components/menu/home/dashboard';
import QuestionDialog from '@/components/global/dialog/question';

export default function Home() {
  const { token } = useAuth();

  return (
    <>
      {token ? <Dashboard /> : <LandingPage />}
      <QuestionDialog />
    </>
  );
}
