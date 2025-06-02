import { useEffect } from "react";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import { getAreaList } from "../api/starsApi";
import { Area } from "../components/stars/map/MapSectionComponent";
import type { Feature, Point } from "geojson";
import { LocationControl } from "../components/stars/map/CustomControl";

interface UseMapboxInitParams {
    mapContainer: React.RefObject<HTMLDivElement | null>;
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
    setSelectedAreaId: (areaId: number | null) => void;
    setShowFocusCard: (show: boolean) => void;
}

export function useMapboxInit({
    mapContainer,
    mapRef,
    setSelectedAreaId,
    setShowFocusCard,
}: UseMapboxInitParams) {
    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/minseoks/cm99i4icd00fe01r9gia5c055",
            center: [126.9779692, 37.566535] as LngLatLike,
            zoom: 10.8,
            minZoom: 10.8,
            maxBounds: [
                [126.734086, 37.413294], // Southwest (SW) corner - 대략 서울 남서쪽
                [127.269311, 37.715133], // Northeast (NE) corner - 대략 서울 북동쪽
            ],
        });
        map.addControl(
            new NavigationControl({ visualizePitch: true }),
            "right"
        );
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            "right"
        );
        map.addControl(new LocationControl(), "right");

        mapRef.current = map;

        getAreaList().then((areaList: Area[]) => {
            const features: Feature<Point>[] = areaList.map((area) => ({
                type: "Feature",
                properties: {
                    area_id: area.area_id,
                    area_name: area.area_name,
                },
                geometry: {
                    type: "Point",
                    coordinates: [area.lon, area.lat],
                },
            }));

            map.on("load", () => {
                map.addSource("areas", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features,
                    },
                    cluster: true,
                    clusterMaxZoom: 16,
                    clusterRadius: 40,
                });

                map.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "areas",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": "rgba(40,140,255,0.4)",
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            4,
                            24,
                            7,
                            28,
                            10,
                            32,
                            13,
                            36,
                            16,
                            40,
                            19,
                            44,
                            22,
                            48,
                            25,
                            52,
                            28,
                            56,
                        ],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                map.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "areas",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "rgba(40,140,255,0.8)",
                        "circle-radius": 12,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                map.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "areas",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": [
                            "Open Sans Bold",
                            "Arial Unicode MS Bold",
                        ],
                        "text-size": 14,
                    },
                    paint: {
                        "text-color": "#288cff",
                    },
                });

                map.on("click", "clusters", (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ["clusters"],
                    });
                    const clusterId = features[0].properties?.cluster_id;
                    const source = map.getSource(
                        "areas"
                    ) as mapboxgl.GeoJSONSource;
                    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        const safeZoom = zoom != null ? zoom : undefined;
                        map.easeTo({
                            center: (features[0].geometry as Point)
                                .coordinates as [number, number],
                            zoom: safeZoom,
                        });
                    });
                });
                map.on("click", "unclustered-point", (e) => {
                    const feature = e.features?.[0] as Feature<Point>;
                    if (!feature) return;
                    const areaId = feature.properties?.area_id;
                    setSelectedAreaId(areaId != null ? areaId : undefined);
                    map.flyTo({
                        center: feature.geometry.coordinates as [
                            number,
                            number,
                        ],
                        zoom: 16,
                        pitch: 45,
                    });
                    map.once("moveend", () => {
                        requestAnimationFrame(() => {
                            setShowFocusCard(true);
                        });
                    });
                });

                map.on("mouseenter", "clusters", () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.on("mouseleave", "clusters", () => {
                    map.getCanvas().style.cursor = "";
                });
                map.on("mouseenter", "unclustered-point", () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.on("mouseleave", "unclustered-point", () => {
                    map.getCanvas().style.cursor = "";
                });
            });
        });

        return () => map.remove();
    }, [mapContainer, mapRef, setSelectedAreaId, setShowFocusCard]);
}
