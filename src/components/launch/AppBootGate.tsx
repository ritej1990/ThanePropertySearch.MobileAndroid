import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { AppLaunchScreen } from './AppLaunchScreen';
import { AppWelcomeScreen } from './AppWelcomeScreen';

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
    return (
      <View style={styles.hold}>
        <ThaneFlatsLogo size={48} showWordmark animated onDark />
      </View>
    );
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

const styles = StyleSheet.create({
  hold: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navyDeep,
    padding: 24,
  },
});
