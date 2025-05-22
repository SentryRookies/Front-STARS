import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import { getEventList } from "../../api/starsApi";

interface TourList {
    category: string;
    gu: string;
    event_name: string;
    start_date: string;
    end_date: string;
    is_free: boolean;
    event_fee?: string;
}

interface GetTourList {
    category: string;
    address: string;
    event_name: string;
    start_date: string;
    end_date: string;
    event_fee: string;
}

const AdminTour = () => {
    const [list, setList] = useState<TourList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedEvent, setSelectedEvent] = useState<TourList | null>(null);
    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // 화면 크기 체크
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768);
            // 모바일에서는 자동으로 그리드 모드로 변경
            if (window.innerWidth < 768) {
                setViewMode("grid");
            }
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // 데이터 로드 함수
    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            const response: GetTourList[] = await getEventList();

            if (response && response.length > 0) {
                const tourData: TourList[] = response.map((e) => ({
                    category: e.category,
                    gu: e.address,
                    event_name: e.event_name,
                    start_date: e.start_date,
                    end_date: e.end_date,
                    is_free: e.event_fee === "" || e.event_fee === "무료",
                    event_fee: e.event_fee,
                }));

                setList(tourData);
            } else {
                setError("이벤트 데이터가 비어있거나 정의되지 않았습니다.");
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError("문화 행사 데이터를 불러오는데 실패했습니다.");
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchEvents();
    }, []);

    // 필터링 로직
    const filteredList = list.filter((item) => {
        const matchesCategory = filterCategory
            ? item.category === filterCategory
            : true;
        const matchesSearch = searchTerm
            ? item.event_name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchesCategory && matchesSearch;
    });

    // 이벤트 선택 핸들러
    const handleEventClick = (event: TourList) => {
        if (!event.is_free) {
            setSelectedEvent(event);
        }
    };

    // 모달 닫기 핸들러
    const closeModal = () => {
        setSelectedEvent(null);
    };

    // Esc 키로 모달 닫기 기능
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && selectedEvent) {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleEscKey);
        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [selectedEvent]);

    // 고유한 카테고리 목록 추출
    const categories = Array.from(new Set(list.map((item) => item.category)));

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        if (!dateString) return "날짜 없음";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            console.error("날짜 형식 변환 오류:", error);
            return dateString;
        }
    };

    // 카테고리별 색상 반환
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            음악: "bg-purple-100 text-purple-800 border-purple-300",
            공연: "bg-pink-100 text-pink-800 border-pink-300",
            전시: "bg-blue-100 text-blue-800 border-blue-300",
            축제: "bg-orange-100 text-orange-800 border-orange-300",
            체험: "bg-green-100 text-green-800 border-green-300",
            기타: "bg-gray-100 text-gray-800 border-gray-300",
        };
        return colors[category] || colors["기타"];
    };

    // 상태별 배지 색상
    const getStatusColor = (isFree: boolean) => {
        return isFree
            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
            : "bg-rose-100 text-rose-800 border-rose-300";
    };

    // 로딩 스켈레톤 컴포넌트
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
                <div key={idx} className="animate-pulse">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // 그리드 뷰 컴포넌트
    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item, index) => (
                <div
                    key={`${item.event_name}-${index}`}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                        !item.is_free ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleEventClick(item)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(item.category)}`}
                        >
                            {item.category}
                        </span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.is_free)}`}
                        >
                            {item.is_free ? "무료" : "유료"}
                            {!item.is_free && (
                                <svg
                                    className="inline-block w-3 h-3 ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                        {item.event_name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <svg
                                className="w-4 h-4 mr-2 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {item.gu}
                        </div>
                        <div className="flex items-center">
                            <svg
                                className="w-4 h-4 mr-2 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {formatDate(item.start_date)} ~{" "}
                            {formatDate(item.end_date)}
                        </div>
                    </div>

                    {!item.is_free && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-xs text-blue-600 font-medium">
                                클릭하여 요금 정보 보기
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // 테이블 뷰 컴포넌트
    const TableView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-1 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-16">
                                카테고리
                            </th>
                            <th className="px-1 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                행사명
                            </th>
                            <th className="px-1 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-16">
                                지역
                            </th>
                            <th className="px-1 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-20">
                                기간
                            </th>
                            <th className="px-1 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-14">
                                요금
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredList.map((item, index) => (
                            <tr
                                key={`${item.event_name}-${index}`}
                                className={`hover:bg-gray-50 transition-colors ${
                                    !item.is_free ? "cursor-pointer" : ""
                                }`}
                                onClick={() => handleEventClick(item)}
                            >
                                <td className="px-1 py-2 whitespace-nowrap w-16">
                                    <span
                                        className={`px-1 py-0.5 rounded text-xs font-semibold border ${getCategoryColor(item.category)} truncate block`}
                                        title={item.category}
                                    >
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-1 py-2 max-w-xs">
                                    <div
                                        className="text-sm font-medium text-gray-900 truncate"
                                        title={item.event_name}
                                    >
                                        {item.event_name}
                                    </div>
                                </td>
                                <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-600 w-16">
                                    <div
                                        className="truncate text-xs"
                                        title={item.gu}
                                    >
                                        {item.gu}
                                    </div>
                                </td>
                                <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-600 w-20">
                                    <div
                                        title={`${formatDate(item.start_date)} ~ ${formatDate(item.end_date)}`}
                                    >
                                        <div className="truncate">
                                            {formatDate(item.start_date)}
                                        </div>
                                        <div className="text-gray-400 truncate">
                                            ~ {formatDate(item.end_date)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-1 py-2 whitespace-nowrap w-14">
                                    <span
                                        className={`px-1 py-0.5 rounded text-xs font-semibold border ${getStatusColor(item.is_free)} truncate block`}
                                    >
                                        {item.is_free ? "무료" : "유료"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col w-full">
            {/* Header */}
            <AdminHeader path={"/manage"} />

            {/* 메인 컨테이너 */}
            <div className="flex-1 p-4 md:p-6">
                {/* 에러 메시지 */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    오류 발생!
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={fetchEvents}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 컨트롤 섹션 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* 제목과 카운트 */}
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    문화 행사 관리
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    총{" "}
                                    <span className="font-semibold text-blue-600">
                                        {list.length}
                                    </span>
                                    개 중{" "}
                                    <span className="font-semibold text-blue-600">
                                        {filteredList.length}
                                    </span>
                                    개 표시
                                    {loading && (
                                        <span className="inline-flex items-center ml-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-blue-500 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="text-blue-500 text-sm">
                                                로딩 중
                                            </span>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* 뷰 모드 토글 - 모바일에서는 숨김 */}
                        {!isMobileView && (
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "bg-white text-gray-900 hover:text-indigo-600 shadow-sm border border-gray-200"
                                    }`}
                                >
                                    <svg
                                        className="w-4 h-4 inline-block mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    그리드
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === "table"
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "bg-white text-gray-900 hover:text-indigo-600 shadow-sm border border-gray-200"
                                    }`}
                                >
                                    <svg
                                        className="w-4 h-4 inline-block mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    테이블
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 필터 및 검색 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {/* 카테고리 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                카테고리
                            </label>
                            <select
                                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={filterCategory}
                                onChange={(e) =>
                                    setFilterCategory(e.target.value)
                                }
                            >
                                <option value="">전체 카테고리</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 검색 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                행사명 검색
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="행사 제목 검색..."
                                    className="w-full px-4 py-2 pl-10 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-end gap-2">
                            <button
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                onClick={() => {
                                    setFilterCategory("");
                                    setSearchTerm("");
                                }}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                초기화
                            </button>
                            <button
                                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={fetchEvents}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin w-4 h-4 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        새로고침
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                        새로고침
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div>
                    {loading && list.length === 0 ? (
                        <LoadingSkeleton />
                    ) : filteredList.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.657a7.962 7.962 0 01-6-2.366"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {list.length > 0
                                    ? "검색 조건에 맞는 행사가 없습니다"
                                    : "등록된 문화 행사가 없습니다"}
                            </h3>
                            <p className="text-gray-500">
                                {list.length > 0
                                    ? "다른 검색 조건을 시도해보세요."
                                    : "새로운 문화 행사를 등록해보세요."}
                            </p>
                        </div>
                    ) : viewMode === "grid" || isMobileView ? (
                        <GridView />
                    ) : (
                        <TableView />
                    )}
                </div>
            </div>

            {/* 요금 정보 모달 */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">
                                        요금 정보
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30`}
                                    >
                                        {selectedEvent.category}
                                    </span>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    aria-label="닫기"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* 모달 컨텐츠 */}
                        <div className="p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4">
                                {selectedEvent.event_name}
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <svg
                                        className="w-5 h-5 text-gray-400 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            장소
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedEvent.gu}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <svg
                                        className="w-5 h-5 text-gray-400 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            기간
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(
                                                selectedEvent.start_date
                                            )}{" "}
                                            ~{" "}
                                            {formatDate(selectedEvent.end_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-blue-600 mr-3 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 mb-2">
                                                요금 정보
                                            </p>
                                            <div className="bg-white/70 p-3 rounded-lg">
                                                <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {selectedEvent.event_fee ||
                                                        "상세한 요금 정보가 제공되지 않았습니다."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-amber-600 mr-3 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 mb-1">
                                                안내사항
                                            </p>
                                            <p className="text-xs text-amber-800">
                                                요금은 변동될 수 있으니 방문 전
                                                공식 사이트나 전화로 확인해
                                                주세요.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 모달 푸터 */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={closeModal}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                확인
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                ESC 키를 눌러서도 닫을 수 있습니다
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTour;
