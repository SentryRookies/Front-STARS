import UserPlaceSuggestion from "./UserPlaceSuggestion";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { getUserSuggestionList } from "../../../api/suggestionApi";

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
}:SuggestionProps){
    // 장소 추천 데이터 상태
    const [suggestionList, setSuggestionList] = useState<Suggestion[]>([]);
    // 사용자 정보 데이터
    const [userData, setUserData] = useState<UserInfoType | null>(null);

    // 추천 생성 | 이전 추천 조회
    const [isCreate, setIsCreate] = useState<boolean>(false);
    // 로딩 상태
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 에러 상태
    const [error, setError] = useState<string | null>(null);

    // 맞춤코스 추천 ai작동 결과
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
                console.log('회원정보!!!',response)

                await loadSuggestion(response.user_id);

            } else {
                setError("사용자 정보를 불러오는데 실패했습니다.");
                // 오류 발생 시 기본 데이터 설정
                setUserData(initialUserData);
            }
        } catch (err) {
            console.error(err);
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
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
            console.log('?DSDFSDFSDFS')
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


    
    return(
        <div id="place_suggestion_wrap"
        className={`absolute md:bottom-0 bottom-0 max-h-[80vh] bg-white shadow-lg rounded-2xl transition-transform duration-300 z-20 overflow-hidden ${
          isOpen
            ? "md:translate-x-0 translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[-110%] pointer-events-none"
        }`}>
            <div className="p-5 h-full flex flex-col overflow-y-auto hide-scrollbar max-h-[80vh] text-black relative w-[90vw] max-w-[500px]">
                {/* 닫기 버튼 - 오른쪽 상단, 배경 흰색으로 맞춤 */}
                <div className="fixed top-2 right-2 z-10 bg-white rounded-full">

                <div className="flex items-center">
                    {isCreate || showResult?
                        <div className="p-2 cursor-pointer bg-white rounded-full"
                            onClick={ async () => {
                                setIsCreate(false);
                                if(showResult === true){
                                    await loadSuggestion(userData?.user_id);
                                    setShowResult(false);
                                    setSuggestionResult({} as Suggestion)
                                }
                            }}>
                            <FaBars size={12} className="bg-white text-purple-600 hover:text-purple-800" />
                        </div>
                    :null}

                    <button 
                        onClick={() => {
                            setShowResult(false);
                            setSuggestionResult({} as Suggestion)
                            onClose();
                        }}
                        className="bg-white text-purple-600 hover:text-purple-800 focus:outline-none rounded-full p-1"
                        aria-label="닫기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                </div>
                {isCreate?
                    <UserPlaceSuggestion setIsCreate={setIsCreate} setShowResult={setShowResult} setSuggestionResult={setSuggestionResult} 
                        userData={userData} />
                    :
                    // 여행지 루트 생성 결과
                    showResult?
                        suggestionResult ?
                            <div className="space-y-4 p-3 bg-gray-100 rounded-xl mb-2">
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    {formatDateTime(suggestionResult.start_time)}
                                    <br />
                                    {formatDateTime(suggestionResult.finish_time)}
                                </div>
                                <div className="text-gray-700 text-sm">
                                    <p className="mb-2">
                                        <span className="font-semibold">출발지</span> 
                                        <span className="whitespace-pre-line block ml-1">{suggestionResult.start_place}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold">요청사항</span> 
                                        <span className="whitespace-pre-line block ml-1">{suggestionResult.optional_request}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-line text-sm">
                                    {suggestionResult.answer}
                                </div>
                                <div className="flex justify-end items-center text-sm text-gray-400">
                                    생성일 : {formatDateTime(suggestionResult.created_at)}
                                </div>
                            </div>

                        :<div>생성 실패~</div>
                    :
                        <div className="position-relative">
                            {/* 이전 여행장소 추천 목록 */}
                            <div className="mb-[50px]">
                                <h2 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">나만의 여행 코스</h2>
                                    {suggestionList.length != 0?
                                        suggestionList.map((item, index) => (
                                            <div key={index} className="space-y-4 p-3 bg-gray-100 rounded-xl mb-2">
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    {formatDateTime(item.start_time)}
                                                    <br />
                                                    {formatDateTime(item.finish_time)}
                                                </div>
                                                <div className="text-gray-700 text-sm">
                                                    <p className="mb-2">
                                                        <span className="font-semibold">요청사항</span> 
                                                        <span className="whitespace-pre-line block ml-1">{item.optional_request}</span>
                                                    </p>
                                                    <p className="mb-2">
                                                        <span className="font-semibold">출발지</span> 
                                                        <span className="whitespace-pre-line block ml-1">{item.start_place}</span>
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-line text-sm">
                                                    {item.answer}
                                                </div>
                                                <div className="flex justify-end items-center text-sm text-gray-400">
                                                    생성일 : {formatDateTime(item.created_at)}
                                                </div>
                                            </div>
                                        ))
                                    :
                                    <p className="text-xs text-gray-500 text-center mb-4">추천 기록이 없습니다.</p>
                                    }

                            </div>


                            <div className={`snap-start shrink-0 h-22 rounded-xl p-3 flex flex-col justify-start gap-5 transition-all duration-200 cursor-pointer border-2
                                    bg-gradient-to-r from-purple-600 to-blue-500 shadow-md shadow-purple-100 fixed bottom-[10px] w-[calc(100%-2.5rem)]`}
                                    onClick={()=>setIsCreate(!isCreate)}
                                    >
                                    <div className={`text-sm font-bold text-white text-center`}>
                                        여행 코스 추천받기
                                    </div>
                            </div>

                            

                        </div>

                }
                
            </div>
        </div>
    )
}