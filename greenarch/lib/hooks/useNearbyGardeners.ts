/**
 * useNearbyGardeners Hook - Fetch gardeners near user location
 */
import { useState, useEffect } from 'react';
import { useLocation } from './useLocation';

export function useNearbyGardeners() {
  const { location } = useLocation();
  const [gardeners, setGardeners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      // TODO: Fetch gardeners from Firestore using GeoFirestore
      setLoading(false);
    }
  }, [location]);

  return { gardeners, loading };
}
