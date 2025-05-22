import { useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { SearchResult } from "../api/searchApi";
import { createPopupHTML } from "../components/stars/map/mapPopupUtils";
import useFavorites from "./useFavorites";

/**
 * Custom hook to manage map markers
 * @param map - Reference to the mapbox map instance
 * @returns Functions for managing markers
 */
function useMapMarkers(map: React.RefObject<mapboxgl.Map | null>) {
    // Store markers with their associated items
    const markersRef = useRef<
        { marker: mapboxgl.Marker; item: SearchResult }[]
    >([]);
    const { isItemFavorite } = useFavorites();

    // Bind event handlers to popup elements
    const bindPopupEvents = useCallback(
        (
            popup: mapboxgl.Popup,
            item: SearchResult,
            setSelectedAreaId: (id: number) => void,
            setShowFocusCard: (show: boolean) => void
        ) => {
            const popupEl = popup.getElement();
            if (!popupEl) return;

            // Find favorite buttons
            const favBtn = popupEl.querySelector(".favorite-btn");
            if (favBtn) {
                // Remove any existing event listeners to prevent duplicates
                const newFavBtn = favBtn.cloneNode(true);
                if (favBtn.parentNode) {
                    favBtn.parentNode.replaceChild(newFavBtn, favBtn);
                }

                newFavBtn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    // Get data attributes
                    const type =
                        (newFavBtn as Element).getAttribute("data-type") || "";
                    const placeId =
                        (newFavBtn as Element).getAttribute("data-place-id") ||
                        "";

                    // Dispatch a custom event that the MapSectionComponent will listen for
                    const event = new CustomEvent("favorite-toggle", {
                        detail: { type, placeId, element: newFavBtn },
                    });
                    document.dispatchEvent(event);
                });
            }

            // Find detail button
            const detailBtn = popupEl.querySelector(".detail-btn");
            if (detailBtn) {
                // Remove any existing event listeners to prevent duplicates
                const newDetailBtn = detailBtn.cloneNode(true);
                if (detailBtn.parentNode) {
                    detailBtn.parentNode.replaceChild(newDetailBtn, detailBtn);
                }

                newDetailBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const areaId = (newDetailBtn as Element).getAttribute(
                        "data-area-id"
                    );
                    if (areaId) {
                        setSelectedAreaId(Number(areaId));
                        setShowFocusCard(true);
                    }
                });
            }
        },
        [
            /* No dependencies needed as we're cloning nodes to prevent stale closures */
        ]
    );

    // Create markers for search results
    const createMarkers = useCallback(
        (
            items: SearchResult[],
            setSelectedAreaId: (id: number) => void,
            setShowFocusCard: (show: boolean) => void
        ) => {
            const mapInstance = map.current;
            if (!mapInstance) return;

            // Clear existing markers
            clearMarkers();

            // Create new markers
            const newMarkers = items.map((item) => {
                const el = document.createElement("div");
                el.className = "custom-marker";

                const popup = new mapboxgl.Popup({
                    offset: 10,
                    closeButton: false,
                    maxWidth: "1000px",
                }).setHTML(
                    createPopupHTML(
                        item,
                        isItemFavorite(item.type, item.id ?? item.place_id)
                    )
                );

                popup.on("open", () => {
                    bindPopupEvents(
                        popup,
                        item,
                        setSelectedAreaId,
                        setShowFocusCard
                    );
                });

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([item.lon, item.lat])
                    .setPopup(popup)
                    .addTo(mapInstance);

                return { marker, item };
            });

            markersRef.current = newMarkers;

            // If there are markers, fly to the first one
            if (newMarkers.length > 0) {
                mapInstance.flyTo({
                    center: [items[0].lon, items[0].lat],
                    zoom: 15,
                    pitch: 45,
                });
                setShowFocusCard(false);
            }

            return newMarkers;
        },
        [map, bindPopupEvents, isItemFavorite]
    );

    // Clear all markers
    const clearMarkers = useCallback(() => {
        markersRef.current.forEach(({ marker }) => marker.remove());
        markersRef.current = [];
    }, []);

    // Find a marker by item properties
    const findMarker = useCallback((item: SearchResult) => {
        return markersRef.current.find(
            (m) => m.item.place_id === item.place_id
        );
    }, []);

    // Focus on a specific marker
    const focusMarker = useCallback(
        (item: SearchResult) => {
            console.log("클릭된 아이템 place_id:", item.place_id);
            console.log(
                "마커 리스트 place_id 배열:",
                markersRef.current.map((m) => m.item.place_id)
            );
            const mapInstance = map.current;
            if (!mapInstance) return;

            // Close all popups
            markersRef.current.forEach(({ marker }) =>
                marker.getPopup()?.remove()
            );

            // Find and focus the marker
            const found = markersRef.current.find((m) => {
                const isEqual = m.item.place_id === item.place_id;
                console.log(
                    "비교:",
                    m.item.place_id,
                    typeof m.item.place_id,
                    "vs",
                    item.place_id,
                    typeof item.place_id,
                    "=>",
                    isEqual
                );
                return isEqual;
            });

            console.log("found", found);
            if (found) {
                mapInstance.flyTo({
                    center: [item.lon, item.lat],
                    zoom: 17,
                    pitch: 45,
                });
                found.marker.togglePopup();
            }
        },

        [map, findMarker]
    );

    // Return the markers and functions
    return {
        markers: markersRef.current,
        createMarkers,
        clearMarkers,
        findMarker,
        focusMarker,
    };
}

export { useMapMarkers };
