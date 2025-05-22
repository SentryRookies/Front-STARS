import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Coffee } from 'lucide-react';
import { getUserSuggestionList } from "../../../api/suggestionApi";
import ImprovedTravelItinerary from "./TravelPlanPreview";
import UserPlaceSuggestion from "./UserPlaceSuggestion";
import { FaBars } from "react-icons/fa";
import { motion } from "framer-motion";

import { UserInfo as UserInfoType } from "../../../data/UserInfoData";
import { getUserProfile } from "../../../api/mypageApi";

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
    // 에러 상태
    const [error, setError] = useState<string | null>(null);

    // 맞춤코스 추천 ai작동 결과, 데이터
    const [showResult, setShowResult] = useState<boolean>(false);
    const [suggestionResult, setSuggestionResult] = useState<Suggestion>({} as Suggestion);

    // 사용자 정보 불러오는 함수
    const loadUserInfo = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getUserProfile();

            if (response) {
                setUserData(response);
                // console.log('회원정보!!!', response)

                await loadSuggestion(response.user_id);

            } else {
                setError("사용자 정보를 불러오는데 실패했습니다.");
                // 오류 발생 시 기본 데이터 설정
                setUserData(initialUserData);
            }
        } catch (err) {
            console.error(err);
            setError("로그인 후 이용 가능합니다.");
            // 오류 발생 시 기본 데이터 설정
            setUserData(initialUserData);
        } finally {
            setIsLoading(false);
        }
    };

    // suggestion 과거 데이터 로드 함수
    const loadSuggestion = async (userId: string | undefined) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(userId)
            const response = await getUserSuggestionList(userId);

            if (response) {
                setSuggestionList(response);
                console.log(response);
            } else {
                setError(
                    response.message ||
                    "이전 여행 장소 추천 목록을 불러오는데 실패했습니다."
                );
                // 에러 발생 시 빈 배열로 초기화
                setSuggestionList([]);
            }
        } catch (err) {
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            console.log(err);
            // 예외 발생 시 빈 배열로 초기화
            setSuggestionList([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 사용자 정보 불러오기
    useEffect(() => {
        loadUserInfo();
    }, []);

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // 결과 닫기 핸들러
    const handleCloseResult = async () => {
        await loadSuggestion(userData?.user_id);
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
                <h3 className="text-lg font-bold mb-2">오류 발생</h3>
                <p className="mb-4">{error}</p>
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


    return (
        <div id="place_suggestion_wrap"
            className={`absolute md:bottom-0 bottom-0 max-h-[80vh] bg-white shadow-lg rounded-2xl transition-transform duration-300 z-20 overflow-hidden ${isOpen
                    ? "md:translate-x-0 translate-x-0 opacity-100 pointer-events-auto"
                    : "translate-x-[-110%] pointer-events-none"
                }`}>
            <div className="p-5 h-full flex flex-col overflow-y-auto hide-scrollbar max-h-[80vh] text-black relative w-[90vw] max-w-[500px]">
                {/* 닫기 버튼 - 오른쪽 상단, 배경 흰색으로 맞춤 */}
                {!showResult && (
                    <div className="fixed top-2 right-2 z-10 bg-white rounded-full">
                        <div className="flex items-center">
                            {isCreate && (
                                <div 
                                    className="p-2 cursor-pointer bg-white rounded-full"
                                    onClick={() => setIsCreate(false)}
                                >
                                    <FaBars size={12} className="bg-white text-purple-500 hover:text-purple-500" />
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setSuggestionResult({} as Suggestion)
                                    onClose();
                                }}
                                className="bg-white text-purple-500 hover:text-purple-500 focus:outline-none rounded-full p-1"
                                aria-label="닫기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                
                {isCreate ? (
                    <UserPlaceSuggestion 
                        setIsCreate={setIsCreate}
                        setShowResult={setShowResult} 
                        setSuggestionResult={setSuggestionResult}
                        userData={userData} 
                    />
                ) : showResult && Object.keys(suggestionResult).length > 0 ? (
                    // 개선된 여행 코스 추천 결과 UI
                    <ImprovedTravelItinerary 
                        suggestion={suggestionResult} 
                        onClose={handleCloseResult} 
                    />
                ) : showResult ? (
                    <div>생성 실패</div>
                ) : (
                    <div className="position-relative">
                        {/* 헤더 */}
                        <div className="mb-4">
                            <h2 className="text-xl font-bold mb-2 text-center text-purple-500">나만의 여행 코스</h2>
                            <p className="text-xs text-gray-500 text-center">당신의 여행 스타일에 맞는 코스를 추천해 드립니다</p>
                        </div>

                        {/* 이전 여행장소 추천 목록 */}
                        <div className="mb-[50px]">
                            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 text-purple-500" />
                                이전 여행 코스
                            </h3>
                            
                            
                            {
                                isLoading ? (
                                    // 로딩 중
                                    <div className="space-y-4">
                                        {Array(3)
                                            .fill(0)
                                            .map((_, index) => (
                                                <FavoriteCardSkeleton key={index} />
                                            ))}
                                    </div>
                                ) : error ? (
                                    // 오류 발생
                                    <ErrorMessage />
                                ):
                            
                            suggestionList.length != 0 ? (
                                <div className="space-y-3">
                                    {suggestionList.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="p-4 bg-white rounded-xl mb-2 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 shadow-sm"
                                            onClick={() => {
                                                setSuggestionResult(item);
                                                setShowResult(true);
                                            }}
                                        >
                                            {/* 날짜/시간 정보 */}
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatDateTime(item.start_time).split(' ').slice(0, 3).join(' ')}
                                                </div>
                                                <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                    {new Date(item.finish_time).getDate() - new Date(item.start_time).getDate() > 0 ? '숙박 여행' : '당일 여행'}
                                                </div>
                                            </div>
                                            
                                            {/* 출발지 */}
                                            <div className="flex items-start gap-2 mb-1">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-xs text-gray-500">출발지</div>
                                                    <div className="text-sm">{item.start_place}</div>
                                                </div>
                                            </div>
                                            
                                            {/* 요청사항 (있는 경우만) */}
                                            {item.optional_request && (
                                                <div className="flex items-start gap-2 mt-2">
                                                    <Coffee className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">요청사항</div>
                                                        <div className="text-sm">{item.optional_request}</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* 생성일 */}
                                            <div className="text-xs text-gray-400 text-right mt-2">
                                                생성일: {formatDateTime(item.created_at).split(' ').slice(0, 3).join(' ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center bg-gray-50 p-4 rounded-lg">
                                    추천 기록이 없습니다.
                                </p>
                            )}
                        </div>

                        {/* 여행 코스 추천받기 버튼 */}
                        <div 
                            className="snap-start shrink-0 h-14 rounded-xl p-4 flex items-center justify-center gap-5 transition-all duration-200 cursor-pointer bg-purple-500 shadow-md fixed bottom-[10px] w-[calc(100%-2.5rem)]"
                            onClick={() => setIsCreate(!isCreate)}
                        >
                            <div className="text-white font-semibold">
                                여행 코스 추천받기
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}