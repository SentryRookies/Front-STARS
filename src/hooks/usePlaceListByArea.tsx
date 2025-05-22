import { useState, useEffect, useCallback } from "react";
import { getPlaceListByArea } from "../api/starsApi";

// Cache for place lists to avoid redundant API calls
const placeListCache: Record<number, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Custom hook to fetch and cache place lists by area
 * @param {number} areaId - The area ID to fetch places for
 * @param {boolean} skipInitialFetch - Whether to skip the initial fetch (default: false)
 * @returns {Object} { placeList, loading, error, fetchPlaceList }
 */
export default function usePlaceListByArea(
    areaId: number | null,
    skipInitialFetch = false
) {
    const [placeList, setPlaceList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchPlaceList = useCallback(async (id: number) => {
        // If we have a cached list and it's still fresh, use it
        const now = Date.now();
        if (
            placeListCache[id] &&
            now - placeListCache[id].timestamp < CACHE_DURATION
        ) {
            setPlaceList(placeListCache[id].data);
            return placeListCache[id].data;
        }

        setLoading(true);
        try {
            const data = await getPlaceListByArea(id);
            placeListCache[id] = { data, timestamp: now };
            setPlaceList(data);
            return data;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error(`Failed to fetch place list for area ${id}`)
            );
            console.error(`Error fetching place list for area ${id}:`, err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (areaId !== null && !skipInitialFetch) {
            fetchPlaceList(areaId);
        }
    }, [areaId, fetchPlaceList, skipInitialFetch]);

    return { placeList, loading, error, fetchPlaceList };
}
