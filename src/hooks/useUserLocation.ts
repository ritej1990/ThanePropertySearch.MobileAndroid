import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveUserGeoPoint, type UserGeoPoint } from '../services/userLocation';

type Result = {
  location: UserGeoPoint | null;
  loading: boolean;
  refresh: () => Promise<UserGeoPoint>;
};

/** Resolves the user's GPS position once on mount; call `refresh` to re-check. */
export function useUserLocation(): Result {
  const [location, setLocation] = useState<UserGeoPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef<Promise<UserGeoPoint> | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) {
      return inFlight.current;
    }

    setLoading(true);
    const task = resolveUserGeoPoint()
      .then((point) => {
        setLocation(point);
        return point;
      })
      .finally(() => {
        inFlight.current = null;
        setLoading(false);
      });

    inFlight.current = task;
    return task;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { location, loading, refresh };
}
