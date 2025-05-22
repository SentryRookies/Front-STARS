import { useState, useRef, useEffect } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import Menu from "./Menu";
import { getAreaList } from "../../../api/starsApi";
import {
    searchByKeyword,
    searchByAddress,
    SearchResult,
} from "../../../api/searchApi";
import type { Area } from "./MapSectionComponent";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    onResultClick?: (items: SearchResult[]) => void;
    onSingleResultClick?: (item: SearchResult) => void;
}

// 거리 계산 함수 (Haversine 공식)
const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function SearchBarWithMenu({
    onSearch,
    onResultClick,
    onSingleResultClick,
}: SearchBarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleSearch = async () => {
        if (!query) return;
        setHasSearched(true);
        const [byKeyword, byAddress] = await Promise.all([
            searchByKeyword(query),
            searchByAddress(query),
        ]);
        const merged = [...byKeyword, ...byAddress].filter(
            (item, idx, arr) =>
                arr.findIndex(
                    (v) => v.name === item.name && v.address === item.address
                ) === idx
        );

        // area_id 매핑
        const areaList = await getAreaList();
        const withAreaId = merged.map((item) => {
            if (item.area_id) return item;
            let minDist = Infinity;
            let nearestAreaId: number | undefined = undefined;
            areaList.forEach((area: Area) => {
                const dist = getDistance(
                    item.lat,
                    item.lon,
                    area.lat,
                    area.lon
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestAreaId =
                        area.area_id !== null ? area.area_id : undefined;
                }
            });
            return { ...item, area_id: nearestAreaId };
        });

        setSearchResults(withAreaId);
        setIsMenuOpen(true);
        if (onSearch) onSearch(query);
        if (onResultClick) onResultClick(withAreaId);
    };

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div ref={wrapperRef}>
            {/* SearchBar */}
            <div
                className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-md bg-white shadow-md flex items-center rounded-full px-2 py-2 transition-all duration-300 ${
                    isMenuOpen
                        ? "bg-opacity-90"
                        : "bg-opacity-60 hover:bg-opacity-90"
                } md:top-6 md:left-6 md:transform-none md:w-96`}
            >
                <button
                    className="flex-shrink-0 bg-transparent text-gray-500 hover:text-gray-700 mr-3 focus:outline-none border-0"
                    onClick={toggleMenu}
                >
                    <FaBars size={20} />
                </button>
                <input
                    type="text"
                    placeholder="궁금하신 장소를 입력하세요!"
                    className="flex-1 min-w-0 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />
                <button
                    className="flex-shrink-0 bg-transparent text-indigo-500 hover:text-indigo-700 transition focus:outline-none border-0"
                    onClick={handleSearch}
                >
                    <FaSearch size={20} />
                </button>
            </div>
            <Menu
                isOpen={isMenuOpen}
                searchData={searchResults}
                hasSearched={hasSearched}
                onResultClick={onSingleResultClick}
            />
        </div>
    );
}
