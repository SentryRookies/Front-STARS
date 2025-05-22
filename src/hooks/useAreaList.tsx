import { useState, useEffect } from 'react';
import { getAreaList } from '../api/starsApi';
import { Area } from '../components/stars/map/MapSectionComponent';

// Cache for area list to avoid redundant API calls
let cachedAreaList: Area[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Custom hook to fetch and cache area list
 * @returns {Object} { areaList, loading, error }
 */
export default function useAreaList() {
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAreaList = async () => {
      // If we have a cached list and it's still fresh, use it
      const now = Date.now();
      if (cachedAreaList && now - lastFetchTime < CACHE_DURATION) {
        setAreaList(cachedAreaList);
        return;
      }

      setLoading(true);
      try {
        const data = await getAreaList();
        cachedAreaList = data;
        lastFetchTime = now;
        setAreaList(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch area list'));
        console.error('Error fetching area list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaList();
  }, []);

  return { areaList, loading, error };
}