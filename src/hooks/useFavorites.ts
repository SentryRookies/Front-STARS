import { useCallback, useEffect, useState } from "react";
import { getUserFavoriteList } from "../api/mypageApi";
import { Favorite } from "../data/adminData";

export function useFavorites(isLogin: boolean) {
    const [favoriteList, setFavoriteList] = useState<Favorite[]>([]);
    const [toggledFavorites, setToggledFavorites] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        if (!isLogin) {
            setToggledFavorites({});
            setFavoriteList([]);
            return;
        }
        getUserFavoriteList().then(setFavoriteList);
    }, [isLogin]);

    const getItemKey = useCallback(
        (type: string, place_id: string | number) =>
            `${type}:${String(place_id)}`,
        []
    );

    const isItemFavorite = useCallback(
        (type: string, place_id: string | number) => {
            const key = getItemKey(type, place_id);
            if (key in toggledFavorites) {
                return toggledFavorites[key];
            }
            return favoriteList.some(
                (f) =>
                    f.type === type && String(f.place_id) === String(place_id)
            );
        },
        [toggledFavorites, favoriteList, getItemKey]
    );

    return {
        favoriteList,
        setFavoriteList,
        toggledFavorites,
        setToggledFavorites,
        isItemFavorite,
        getItemKey,
    };
}
