import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { AppLaunchScreen } from './AppLaunchScreen';
import { AppWelcomeScreen } from './AppWelcomeScreen';

type BootStep = 'init' | 'welcome' | 'launch' | 'done';

type Props = {
  children: React.ReactNode;
};

/**
 * Splash for cold start only. After the user signs in while `step === 'done'`,
 * stay on `done` so the stack can switch to Home immediately (web animations
 * on welcome/launch can otherwise never finish).
 */
export function AppBootGate({ children }: Props) {
  const { token, ready, profile } = useAuth();
  const [step, setStep] = useState<BootStep>('init');

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      if (step !== 'done') {
        setStep('launch');
      }
      return;
    }

    if (step === 'done') {
      return;
    }

    if (step === 'init' || step === 'launch') {
      setStep('welcome');
    }
  }, [ready, token, step]);

  if (!ready || step === 'init') {
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
    return (
      <AppLaunchScreen
        authReady
        onComplete={() => setStep('done')}
      />
    );
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
