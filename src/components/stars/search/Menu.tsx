import { useMemo, useState } from "react";
import useCustomLogin from "../../../hooks/useCustomLogin";
import { SearchResult } from "../../../api/searchApi";

interface MenuProps {
    isOpen: boolean;
    searchData?: SearchResult[];
    hasSearched: boolean;
    onResultClick?: (item: SearchResult) => void;
}

type DropdownType = "category" | null;

const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    cultural_event: "문화행사",
    culturalevent: "문화행사",
};

const categoryColorMap: Record<string, string> = {
    숙박: "text-blue-600",
    관광명소: "text-green-600",
    카페: "text-yellow-600",
    음식점: "text-red-600",
    문화행사: "text-purple-600",
};

const reverseCategoryMap: Record<string, string> = Object.entries(
    categoryMap
).reduce(
    (acc, [key, value]) => {
        acc[value] = key;
        return acc;
    },
    {} as Record<string, string>
);

export default function Menu({
    isOpen,
    searchData,
    hasSearched,
    onResultClick,
}: MenuProps) {
    const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
    const [selectedCategory, setSelectedCategory] =
        useState<string>("카테고리");
    const { isLogin, doLogout, moveToLogin } = useCustomLogin();

    // 카테고리 필터링
    const dataToShow = useMemo(() => {
        if (!searchData || searchData.length === 0) return [];
        return searchData.filter((item) => {
            return (
                selectedCategory === "카테고리" ||
                item.type === reverseCategoryMap[selectedCategory]
            );
        });
    }, [searchData, selectedCategory]);

    return (
        <div
            className={`absolute md:top-28 top-24 max-h-[80vh] md:w-96 w-11/12 bg-white shadow-lg rounded-2xl transition-transform duration-300 z-20 ${
                isOpen
                    ? "md:translate-x-6 translate-x-[18px] opacity-100 pointer-events-auto"
                    : "-translate-x-full pointer-events-none"
            }`}
        >
            <div className="p-2 h-full flex flex-col overflow-y-auto min-h-[25vh] max-h-[70vh]">
                {/* 헤더 */}
                <div className="flex p-2 justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center">
                        <h2 className="text-lg font-bold text-gray-800">
                            추천 명소
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        {renderDropdown(
                            openDropdown === "category",
                            () =>
                                setOpenDropdown(
                                    openDropdown === "category"
                                        ? null
                                        : "category"
                                ),
                            selectedCategory,
                            (v: string) => setSelectedCategory(v),
                            [
                                "카테고리",
                                "숙박",
                                "관광명소",
                                "카페",
                                "음식점",
                                "문화행사",
                            ]
                        )}
                    </div>
                </div>

                {/* 리스트 */}
                <ul className="overflow-y-auto">
                    {!hasSearched ? (
                        <>
                            <li className="py-4 mt-4 text-xl text-gray-600 text-center">
                                반가워요 또 찾아주셨네요.
                            </li>
                            <li className="py-4 text-base text-gray-400 text-center">
                                장소를 입력하여 찾아주세요!
                            </li>
                        </>
                    ) : dataToShow.length === 0 ? (
                        <li className="py-4 mt-8 text-xl text-gray-500 text-center">
                            조건에 맞는 명소가 없습니다.
                        </li>
                    ) : (
                        dataToShow.map((item, idx) => (
                            <li
                                key={`${item.place_id ?? `${item.name}-${item.address}`}-${idx}`}
                                className="py-6 border-b md:mr-2 flex items-center cursor-pointer hover:bg-purple-50"
                                onClick={() => onResultClick?.(item)} // 클릭 시 단일 핸들러 호출
                            >
                                <div className="flex-[3] flex flex-col items-center justify-center text-center">
                                    <div className="font-semibold text-gray-800 text-lg">
                                        {item.name}
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                        {item.address}
                                    </div>
                                </div>

                                <div
                                    className={`
                                        flex-[1] flex items-center justify-center text-sm px-2 py-1 rounded
                                        ${categoryColorMap[categoryMap[item.type] ?? item.type] ?? "text-gray-700"}
                                    `}
                                >
                                    {categoryMap[item.type] ?? item.type}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                <div className="flex items-center justify-end mt-auto">
                    {!isLogin ? (
                        <span
                            className="underline text-indigo-500 font-semibold cursor-pointer hover:text-indigo-700 transition px-2 py-1"
                            onClick={moveToLogin}
                        >
                            로그인/회원가입
                        </span>
                    ) : (
                        <span
                            className="underline text-red-500 font-semibold cursor-pointer hover:text-red-700 transition px-2 py-1"
                            onClick={doLogout}
                        >
                            로그아웃
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// 공통 드롭다운 렌더링 함수
function renderDropdown(
    isOpen: boolean,
    toggleOpen: () => void,
    selected: string,
    setSelected: (value: string) => void,
    options: string[]
) {
    return (
        <div className="relative">
            <div
                onClick={toggleOpen}
                className="flex items-center justify-between text-gray-700 cursor-pointer text-sm transition"
            >
                {selected}
                <svg
                    className="w-3 h-3 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-gray-50 shadow-lg rounded-md z-10">
                    <ul className="py-1 text-sm text-gray-700">
                        {options.map((item, index) => (
                            <li
                                key={item}
                                className={`px-3 py-1 hover:bg-gray-200 cursor-pointer ${
                                    index === 0
                                        ? "border-b border-gray-300"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelected(item);
                                    toggleOpen();
                                }}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
