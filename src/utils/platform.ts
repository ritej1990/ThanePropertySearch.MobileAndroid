import { Platform } from 'react-native';

/** True on iOS/Android — false on web and other platforms. */
export function isNativeMobile(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
