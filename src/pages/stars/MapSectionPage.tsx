import MapSectionComponent from "../../components/stars/map/MapSectionComponent";

interface MapSectionProps {
    searchKeyword?: string | null;
    onSearchComplete?: () => void;
}

export default function MapSectionPage({
    searchKeyword,
    onSearchComplete,
}: MapSectionProps) {
    return (
        <div>
            <MapSectionComponent
                searchKeyword={searchKeyword}
                onSearchComplete={onSearchComplete}
            />
        </div>
    );
}
