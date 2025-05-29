import React, { useState, useRef, useEffect } from "react";
import { MapPin, Calendar, Coffee, RefreshCw, LogIn } from "lucide-react";
import { getUserSuggestionList } from "../../../api/suggestionApi";
import ImprovedTravelItinerary from "./TravelPlanPreview";
import UserPlaceSuggestion from "./UserPlaceSuggestion";
import { Undo2 } from "lucide-react";
import { motion } from "framer-motion";

import { UserInfo as UserInfoType } from "../../../data/UserInfoData";
import { getUserProfile } from "../../../api/mypageApi";
import useCustomLogin from "../../../hooks/useCustomLogin";

interface SuggestionProps {
    isOpen: boolean;
    onClose: () => void;
}

export type Suggestion = {
    answer: string;
    birth_year: number;
    created_at: string;
    finish_time: string;
    gender: string;
    mbti: string;
    optional_request: string;
    start_place: string;
    start_time: string;
};

const initialUserData: UserInfoType = {
    member_id: "",
    user_id: "",
    nickname: "",
    current_password: "",
    chk_password: "",
    birth_year: 0,
    mbti: "",
    gender: "",
    created_at: "",
};

export default function PlaceSuggestionShow({
    isOpen,
    onClose,
}: SuggestionProps) {
    // 이전 장소 추천 데이터
    const [suggestionList, setSuggestionList] = useState<Suggestion[]>([]);
    // 사용자 정보 데이터
    const [userData, setUserData] = useState<UserInfoType | null>(null);

    // 추천 생성 | 이전 추천 조회
    const [isCreate, setIsCreate] = useState<boolean>(false);
    // 로딩 상태
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 새로고침 로딩 상태 (별도 관리)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    // 에러 상태
    const [error, setError] = useState<string | null>(null);

    // 맞춤코스 추천 ai작동 결과, 데이터
    const [showResult, setShowResult] = useState<boolean>(false);
    const [suggestionResult, setSuggestionResult] = useState<Suggestion>(
        {} as Suggestion
    );

    // 데이터 로딩 상태 관리 - 처음 한 번만 로딩하기 위한 ref
    const isInitialized = useRef<boolean>(false);
    const hasLoadedData = useRef<boolean>(false);

    // 로그인 여부 확인
    const { isLogin, moveToLogin } = useCustomLogin();

    // 로그인 페이지로 이동하는 함수
    const handleLoginRedirect = () => {
        moveToLogin();
    };

    // 사용자 정보 불러오는 함수
    const loadUserInfo = async (isRefresh: boolean = false) => {
        // 로그인하지 않은 경우 로딩을 중단
        if (!isLogin) {
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }

        if (!isRefresh && hasLoadedData.current) {
            return;
        }

        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const response = await getUserProfile();

            if (response) {
                setUserData(response);

                await loadSuggestion(response.user_id);
                if (!isRefresh) {
                    hasLoadedData.current = true; // 데이터 로딩 완료 플래그 설정
                }
            } else {
                setError("사용자 정보를 불러오는데 실패했습니다.");
                setUserData(initialUserData);
            }
        } catch (err) {
            console.error(err);
            setError("로그인 후 이용 가능합니다.");
            setUserData(initialUserData);
        } finally {
            if (isRefresh) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    };

    // suggestion 과거 데이터 로드 함수
    const loadSuggestion = async (
        userId: string | undefined
        // isRefresh: boolean = false
    ) => {
        if (!userId) return;

        try {
            const response = await getUserSuggestionList(userId);

            if (response) {
                setSuggestionList(response);
            } else {
                setError(
                    response.message ||
                        "이전 여행 장소 추천 목록을 불러오는데 실패했습니다."
                );
                setSuggestionList([]);
            }
        } catch (err) {
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            console.error(err);
            setSuggestionList([]);
        }
    };

    // 새로고침 핸들러
    const handleRefresh = async () => {
        if (!isLogin) return;
        await loadUserInfo(true);
    };

    // 컴포넌트 마운트 시 한 번만 데이터 로딩
    useEffect(() => {
        if (isOpen && !isInitialized.current) {
            isInitialized.current = true;
            loadUserInfo();
        }
    }, [isOpen, isLogin]);

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // 결과 닫기 핸들러 - 데이터 새로고침 제거
    const handleCloseResult = () => {
        setShowResult(false);
        setSuggestionResult({} as Suggestion);
    };

    // 오류 메시지 컴포넌트
    const ErrorMessage = () => (
        <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <svg
                className="w-12 h-12 text-red-500 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <p className="mb-4">{error}</p>
            {isLogin && (
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    다시 시도
                </button>
            )}
        </motion.div>
    );

    // 로딩 스켈레톤 컴포넌트
    const FavoriteCardSkeleton = () => (
        <div className="animate-pulse bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="mt-3 h-3 bg-gray-200 rounded w-full"></div>
        </div>
    );

    // 비로그인 상태일 때 보여줄 컴포넌트
    const LoginPrompt = () => (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="bg-purple-50 rounded-full p-6 mb-6">
                <LogIn className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                로그인이 필요합니다
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                나만의 여행 코스 추천을 받으려면
                <br />
                로그인해 주세요
            </p>
            <button
                onClick={handleLoginRedirect}
                className="w-full max-w-xs bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <LogIn className="w-5 h-5" />
                로그인하러 가기
            </button>
        </div>
    );

    return (
        <div
            id="place_suggestion_wrap"
            className={`absolute md:bottom-0 bottom-0 max-h-[80vh] bg-white shadow-lg rounded-2xl transition-transform duration-300 z-20 overflow-hidden ${
                isOpen
                    ? "md:translate-x-0 translate-x-0 opacity-100 pointer-events-auto"
                    : "translate-x-[-110%] pointer-events-none"
            }`}
        >
            <div className="h-full flex flex-col max-h-[80vh] text-black relative w-[90vw] md:w-[500px] max-w-[500px]">
                {/* 닫기 버튼 - 반응형 위치 조정 */}
                {!showResult && (
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white rounded-full shadow-sm">
                        <div className="flex items-center">
                            {isCreate && isLogin && (
                                <div
                                    className="p-2 cursor-pointer bg-white rounded-full hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsCreate(false)}
                                >
                                    <Undo2
                                        size={18}
                                        className="text-purple-500 hover:text-purple-600"
                                    />
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setSuggestionResult({} as Suggestion);
                                    onClose();
                                }}
                                className="bg-white text-purple-500 hover:text-purple-600 hover:bg-gray-50 focus:outline-none rounded-full p-2 transition-colors"
                                aria-label="닫기"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
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
                )}

                {/* 비로그인 상태 처리 */}
                {!isLogin ? (
                    <>
                        {/* 헤더 */}
                        <div className="flex-shrink-0 pt-4 pb-4 px-4 md:px-6 bg-white">
                            <h2 className="text-lg md:text-xl font-bold mb-2 text-center text-purple-500">
                                나만의 여행 코스
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 text-center">
                                당신의 여행 스타일에 맞는 코스를 추천해 드립니다
                            </p>
                        </div>
                        {/* 로그인 프롬프트 */}
                        <div className="flex-1 flex items-center justify-center">
                            <LoginPrompt />
                        </div>
                    </>
                ) : isCreate ? (
                    <UserPlaceSuggestion
                        setIsCreate={setIsCreate}
                        setShowResult={setShowResult}
                        setSuggestionResult={setSuggestionResult}
                        userData={userData}
                        // onSuggestionCreated={refreshSuggestionList} // 새 추천 생성 시 목록 새로고침
                    />
                ) : showResult && Object.keys(suggestionResult).length > 0 ? (
                    // 개선된 여행 코스 추천 결과 UI
                    <ImprovedTravelItinerary
                        suggestion={suggestionResult}
                        onClose={handleCloseResult}
                    />
                ) : showResult ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">생성 실패</div>
                    </div>
                ) : (
                    <>
                        {/* 1. 헤더 영역 - 고정 */}
                        <div className="flex-shrink-0 pt-4 pb-4 px-4 md:px-6 bg-white">
                            <h2 className="text-lg md:text-xl font-bold mb-2 text-center text-purple-500">
                                나만의 여행 코스
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 text-center">
                                당신의 여행 스타일에 맞는 코스를 추천해 드립니다
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <h3 className="text-sm md:text-base font-semibold text-gray-700 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5 text-purple-500" />
                                    이전 여행 코스
                                </h3>
                                {/* 새로고침 버튼 */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing || isLoading}
                                    className="p-2 text-white bg-purple-500 hover:bg-purple-600 disabled:text-gray-400 disabled:hover:bg-transparent rounded-full transition-colors"
                                    aria-label="목록 새로고침"
                                    title="목록 새로고침"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* 2. 스크롤 가능한 카드 목록 영역 */}
                        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 md:px-6">
                            {isLoading ? (
                                // 로딩 중
                                <div className="space-y-3 md:space-y-4">
                                    {Array(3)
                                        .fill(0)
                                        .map((_, index) => (
                                            <FavoriteCardSkeleton key={index} />
                                        ))}
                                </div>
                            ) : error ? (
                                // 오류 발생
                                <ErrorMessage />
                            ) : suggestionList.length != 0 ? (
                                <div className="space-y-3 pb-4">
                                    {/* 새로고침 중일 때 반투명 오버레이 */}
                                    <div
                                        className={`${isRefreshing ? "opacity-50 pointer-events-none" : ""} transition-opacity duration-200`}
                                    >
                                        {suggestionList.map((item, index) => (
                                            <div
                                                key={index}
                                                className="p-3 md:p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 shadow-sm"
                                                onClick={() => {
                                                    setSuggestionResult(item);
                                                    setShowResult(true);
                                                }}
                                            >
                                                {/* 날짜/시간 정보 */}
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="text-xs md:text-sm font-medium text-gray-900">
                                                        {formatDateTime(
                                                            item.start_time
                                                        )
                                                            .split(" ")
                                                            .slice(0, 3)
                                                            .join(" ")}
                                                    </div>
                                                    <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                        {new Date(
                                                            item.finish_time
                                                        ).getDate() -
                                                            new Date(
                                                                item.start_time
                                                            ).getDate() >
                                                        0
                                                            ? "숙박 여행"
                                                            : "당일 여행"}
                                                    </div>
                                                </div>

                                                {/* 출발지 */}
                                                <div className="flex items-start gap-2 mb-1">
                                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            출발지
                                                        </div>
                                                        <div className="text-xs md:text-sm">
                                                            {item.start_place}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 요청사항 (있는 경우만) */}
                                                {item.optional_request && (
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <Coffee className="w-3 h-3 md:w-4 md:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-xs text-gray-500">
                                                                요청사항
                                                            </div>
                                                            <div className="text-xs md:text-sm">
                                                                {
                                                                    item.optional_request
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 생성일 */}
                                                <div className="text-xs text-gray-400 text-right mt-2">
                                                    생성일:{" "}
                                                    {formatDateTime(
                                                        item.created_at
                                                    )
                                                        .split(" ")
                                                        .slice(0, 3)
                                                        .join(" ")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <p className="text-xs md:text-sm text-gray-700 text-center bg-gray-50 p-4 rounded-lg mb-4">
                                        추천 기록이 없습니다.
                                    </p>
                                    {/*<button*/}
                                    {/*    onClick={handleRefresh}*/}
                                    {/*    disabled={isRefreshing}*/}
                                    {/*    className="text-white bg-purple-500 hover:bg-purple-600 disabled:text-gray-400 text-sm flex items-center gap-2 px-4 py-2 rounded-lg"*/}
                                    {/*>*/}
                                    {/*    <RefreshCw*/}
                                    {/*        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}*/}
                                    {/*    />*/}
                                    {/*    새로고침*/}
                                    {/*</button>*/}
                                </div>
                            )}
                        </div>

                        {/* 3. 여행 코스 추천받기 버튼 - 하단 고정 */}
                        <div className="flex-shrink-0 p-3 md:p-4 bg-white border-t border-gray-100">
                            <div
                                className="w-full h-12 md:h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-purple-500 hover:bg-purple-600 shadow-md"
                                onClick={() => setIsCreate(!isCreate)}
                            >
                                <div className="text-white font-semibold text-sm md:text-base">
                                    여행 코스 추천받기
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
