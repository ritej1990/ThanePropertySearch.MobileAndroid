import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { normalizeIndianMobile } from '../utils/phoneNumber';

type Result = {
  phone: string | null;
  loading: boolean;
  source: 'device' | 'none';
};

async function requestAndroidPhonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ]);
    return (
      result[PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      result[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

async function readDevicePhoneNumber(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const allowed = await requestAndroidPhonePermission();
    if (!allowed) return null;

    const DeviceInfo = require('react-native-device-info').default;
    const raw: string = await DeviceInfo.getPhoneNumber();
    return normalizeIndianMobile(raw);
  } catch {
    return null;
  }
}

/** Best-effort SIM / device line number (Android). iOS returns null — use autofill. */
export function useDevicePhoneNumber(): Result {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(Platform.OS === 'android');
  const [source, setSource] = useState<'device' | 'none'>('none');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const detected = await readDevicePhoneNumber();
      if (cancelled) return;
      if (detected) {
        setPhone(detected);
        setSource('device');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { phone, loading, source };
}
