import { useWindowDimensions } from 'react-native';

export type DeviceSize = 'phone' | 'tablet' | 'desktop';

const TABLET_MIN = 600;
const DESKTOP_MIN = 960;

export function getDeviceSize(width: number): DeviceSize {
  if (width >= DESKTOP_MIN) return 'desktop';
  if (width >= TABLET_MIN) return 'tablet';
  return 'phone';
}

/** Column count for property listing grids (matches web col-sm-6 / col-xl-4). */
export function listingColumnCount(width: number): number {
  if (width >= DESKTOP_MIN) return 3;
  if (width >= TABLET_MIN) return 2;
  return 1;
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const size = getDeviceSize(width);
  return {
    width,
    height,
    size,
    isPhone: size === 'phone',
    isTablet: size === 'tablet',
    isDesktop: size === 'desktop',
    listColumns: listingColumnCount(width),
    contentMaxWidth: size === 'phone' ? width : Math.min(width - 32, 1200),
    horizontalPad: size === 'phone' ? 12 : size === 'tablet' ? 20 : 24,
  };
}
