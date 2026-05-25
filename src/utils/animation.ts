import { Platform } from 'react-native';

/**
 * Native animated driver (RCTAnimation) is not available on web.
 * Using `useNativeDriver: true` there logs a warning and falls back to JS anyway.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';