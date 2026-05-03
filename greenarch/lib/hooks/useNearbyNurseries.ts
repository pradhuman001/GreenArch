/**
 * useNearbyNurseries Hook - Fetch nurseries near user location
 */
import { useState, useEffect } from 'react';
import { useLocation } from './useLocation';

export function useNearbyNurseries() {
  const { location } = useLocation();
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      // TODO: Fetch nurseries from Firestore using GeoFirestore
      // Based on location and radius
      setLoading(false);
    }
  }, [location]);

  return { nurseries, loading };
}
