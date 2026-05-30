import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLaunchScreen } from './AppLaunchScreen';
import { AppWelcomeScreen } from './AppWelcomeScreen';
import { LaunchHoldScreen } from './LaunchHoldScreen';

type BootStep = 'hold' | 'welcome' | 'launch' | 'done';

type Props = {
  children: React.ReactNode;
};

/**
 * Cold-start splash only (once per app process).
 * Logged-in: welcome → launch → app. Guest: launch → login.
 * Does not re-run after login, logout, or navigation.
 */
export function AppBootGate({ children }: Props) {
  const { token, ready, profile } = useAuth();
  const [step, setStep] = useState<BootStep>('hold');
  const bootStartedRef = useRef(false);
  const bootFinishedRef = useRef(false);

  useEffect(() => {
    if (!ready || bootStartedRef.current || bootFinishedRef.current) return;
    bootStartedRef.current = true;
    setStep(token ? 'welcome' : 'launch');
  }, [ready, token]);

  const finishBoot = useCallback(() => {
    if (bootFinishedRef.current) return;
    bootFinishedRef.current = true;
    setStep('done');
  }, []);

  if (!ready || step === 'hold') {
    return <LaunchHoldScreen />;
  }

  if (step === 'welcome') {
    return (
      <AppWelcomeScreen
        profile={profile}
        onComplete={() => setStep('launch')}
      />
    );
  }

  if (step === 'launch') {
    return <AppLaunchScreen authReady onComplete={finishBoot} />;
  }

  return <>{children}</>;
}
