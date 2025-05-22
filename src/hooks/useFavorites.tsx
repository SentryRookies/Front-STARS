import { useState, useEffect, useCallback } from "react";
import {
    getUserFavoriteList,
    addFavorite,
    deleteFavorite,
} from "../api/mypageApi";
import { Favorite } from "../data/adminData";
import useCustomLogin from "./useCustomLogin";

type UseFavoritesResult = {
    favorites: Favorite[];
    loading: boolean;
    error: Error | null;
    addToFavorites: (
        type: string,
        place_id: string | number
    ) => Promise<boolean | void>;
    removeFromFavorites: (
        type: string,
        place_id: string | number
    ) => Promise<boolean | void>;
    isItemFavorite: (type: string, place_id: string | number) => boolean;
};

export default function useFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    // Track local changes before API response
    const [pendingChanges, setPendingChanges] = useState<
        Record<string, boolean>
    >({});
    const { isLogin } = useCustomLogin();

    // Helper to create a unique key for each favorite item
    const getItemKey = useCallback(
        (type: string, place_id: string | number) =>
            `${type}:${String(place_id)}`,
        []
    );

    // Load favorites when user logs in
    useEffect(() => {
        if (!isLogin) {
            setFavorites([]);
            setPendingChanges({});
            return;
        }

        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const data = await getUserFavoriteList();
                setFavorites(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to fetch favorites")
                );
                console.error("Error fetching favorites:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [isLogin]);

    // Check if an item is in favorites
    const isItemFavorite = useCallback(
        (type: string, place_id: string | number) => {
            const key = getItemKey(type, place_id);

            // First check pending changes
            if (key in pendingChanges) {
                return pendingChanges[key];
            }

            // Then check actual favorites
            return favorites.some(
                (f) =>
                    f.type === type && String(f.place_id) === String(place_id)
            );
        },
        [favorites, pendingChanges, getItemKey]
    );

    // Add an item to favorites
    const addToFavorites = useCallback(
        async (type: string, place_id: string | number) => {
            if (!isLogin) {
                console.warn("User must be logged in to add favorites");
                return false;
            }

            const key = getItemKey(type, place_id);

            // Optimistically update UI
            setPendingChanges((prev) => ({ ...prev, [key]: true }));

            try {
                await addFavorite({ type, place_id });

                // Update actual favorites list
                setFavorites((prev) => {
                    // Check if already exists
                    const exists = prev.some(
                        (f) =>
                            f.type === type &&
                            String(f.place_id) === String(place_id)
                    );

                    if (exists) return prev;
                    return [...prev, { type, place_id }];
                });

                // Clear pending state
                setPendingChanges((prev) => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });

                return true;
            } catch (err) {
                // Revert optimistic update
                setPendingChanges((prev) => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });

                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to add favorite")
                );
                console.error("Error adding favorite:", err);
                return false;
            }
        },
        [isLogin, getItemKey]
    );

    // Remove an item from favorites
    const removeFromFavorites = useCallback(
        async (type: string, place_id: string | number) => {
            if (!isLogin) {
                console.warn("User must be logged in to remove favorites");
                return false;
            }

            const key = getItemKey(type, place_id);

            // Optimistically update UI
            setPendingChanges((prev) => ({ ...prev, [key]: false }));

            try {
                await deleteFavorite({ type, place_id });

                // Update actual favorites list
                setFavorites((prev) =>
                    prev.filter(
                        (f) =>
                            !(
                                f.type === type &&
                                String(f.place_id) === String(place_id)
                            )
                    )
                );

                // Clear pending state
                setPendingChanges((prev) => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });

                return true;
            } catch (err) {
                // Revert optimistic update
                setPendingChanges((prev) => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });

                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to remove favorite")
                );
                console.error("Error removing favorite:", err);
                return false;
            }
        },
        [isLogin, getItemKey]
    );

    return {
        favorites,
        loading,
        error,
        addToFavorites,
        removeFromFavorites,
        isItemFavorite,
    };
}
