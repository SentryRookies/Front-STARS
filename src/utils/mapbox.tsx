import mapboxgl from "mapbox-gl";

class MapboxManager {
    private static initialized = false;

    static initialize() {
        if (!this.initialized && import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
            this.initialized = true;
        }
    }
}

export default MapboxManager;
