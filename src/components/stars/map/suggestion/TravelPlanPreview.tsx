import React, { useMemo, useRef, useState } from "react";
import { Calendar, Clock, Coffee, Heart, Home, MapPin } from "lucide-react";
import { Suggestion } from "./PlaceSuggestionShow";
import { parseItineraryFromMarkdown } from "./TravelItineraryParser";
import { DaySchedule, TimeItem } from "../../../../data/TravelItineraryTypes";

interface ImprovedTravelItineraryProps {
    suggestion: Suggestion;
    onClose: () => void;
}

// 아이콘 컴포넌트
export const TipIcon: React.FC<{ className?: string }> = ({
    className = "w-4 h-4 text-purple-600",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 10 10 21l-3.5-3.5L18 6l3 3Z" />
        <path d="m2.5 17.5 3 3L9 18l-3-3Z" />
        <path d="M14 8 8 14" />
    </svg>
);

const ImprovedTravelItinerary: React.FC<ImprovedTravelItineraryProps> = ({
    suggestion,
    onClose,
}) => {
    // 현재 활성화된 일자 탭 상태
    const [activeDay, setActiveDay] = useState(0);
    // 수평 스크롤 참조
    const scrollRef = useRef<HTMLDivElement>(null);

    // 날짜와 시간 포맷팅 함수
    const formatDateTimeComponents = (isoString: string) => {
        if (!isoString) return { date: "", time: "" };

        const date = new Date(isoString);

        // 날짜 포맷팅 (예: 2025년 5월 20일)
        const dateStr = date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        // 시간 포맷팅 (예: 오전 9:00)
        const timeStr = date.toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        return { date: dateStr, time: timeStr };
    };

    // AI 추천사를 추출하고 원본 텍스트에서 제거하는 함수
    const extractAndCleanAnswer = (answerText: string) => {
        // AI 추천사 패턴들 - 여러 문장을 포함하도록 수정
        const recommendationPatterns = [
            /(?:이 일정은|위 일정은|이 여행 코스는)[\s\S]*?(?:성격|성향)[\s\S]*$/,
            /이 일정을 통해[\s\S]*$/,
            /이 코스는[\s\S]*$/,
        ];

        let recommendation = "";
        let cleanedAnswer = answerText;

        // 추천사 찾기 및 제거
        for (const pattern of recommendationPatterns) {
            const match = answerText.match(pattern);
            if (match) {
                // 첫 번째 매치를 AI 추천사로 사용
                if (!recommendation) {
                    recommendation = match[0].replace(/^\$\s*/, "").trim();
                }
                // 매치된 텍스트를 원본에서 제거
                cleanedAnswer = cleanedAnswer.replace(match[0], "");
                break; // 첫 번째 매치만 사용
            }
        }

        // 기본 추천사가 없으면 기본값 설정
        if (!recommendation) {
            recommendation = "즐거운 여행 되세요!";
        }

        // 불필요한 공백과 줄바꿈 정리
        cleanedAnswer = cleanedAnswer
            .replace(/\n{3,}/g, "\n\n") // 3개 이상의 연속 줄바꿈을 2개로
            .replace(/\s+\n/g, "\n") // 줄 끝의 공백 제거
            .trim();

        return {
            aiRecommendation: recommendation,
            cleanedAnswer,
        };
    };

    // 파싱된 일정과 AI 추천사
    const parsedData = useMemo(() => {
        const result = extractAndCleanAnswer(suggestion.answer);
        // $ 기호 제거 후 파싱
        const finalCleanedAnswer = result.cleanedAnswer.replace(/\$\s*/g, "");
        const parsed = parseItineraryFromMarkdown(finalCleanedAnswer);

        return {
            parsedItinerary: parsed,
            aiRecommendation: result.aiRecommendation,
        };
    }, [suggestion.answer]);

    const { parsedItinerary, aiRecommendation } = parsedData;

    // 일자 탭 클릭 핸들러
    const handleDayTabClick = (index: number) => {
        setActiveDay(index);
        // 스크롤 컨테이너가 있으면 해당 일자로 스크롤
        if (scrollRef.current && parsedItinerary.days.length > 0) {
            const container = scrollRef.current;
            const dayWidth =
                container.scrollWidth / parsedItinerary.days.length;
            container.scrollTo({
                left: dayWidth * index,
                behavior: "smooth",
            });
        }
    };

    // 스크롤 이벤트 핸들러 (스크롤 시 activeDay 업데이트)
    const handleScroll = () => {
        if (scrollRef.current && parsedItinerary.days.length > 0) {
            const container = scrollRef.current;
            const scrollLeft = container.scrollLeft;
            const dayWidth =
                container.scrollWidth / parsedItinerary.days.length;
            const newActiveDay = Math.round(scrollLeft / dayWidth);
            if (
                newActiveDay !== activeDay &&
                newActiveDay >= 0 &&
                newActiveDay < parsedItinerary.days.length
            ) {
                setActiveDay(newActiveDay);
            }
        }
    };

    // 일자 탭 렌더링
    const renderDayTabs = () => {
        if (!parsedItinerary.days || parsedItinerary.days.length === 0) {
            return null;
        }

        return (
            <div className="flex overflow-x-auto hide-scrollbar mb-3">
                {parsedItinerary.days.map((day, index) => (
                    <div
                        key={index}
                        className={`flex-shrink-0 px-4 py-2 mx-1 rounded-full cursor-pointer
              ${
                  activeDay === index
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
                        onClick={() => handleDayTabClick(index)}
                    >
                        <span className="text-sm font-medium whitespace-nowrap">
                            {day.title && day.title.includes("Day")
                                ? day.title.split("-")[0].trim()
                                : `Day ${index + 1}`}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // 시간과 내용을 처리하는 함수
    const processTimeAndContent = (timeStr: string, contentStr: string) => {
        // 결과 객체 초기화
        const result = {
            startTime: "",
            endTime: "",
            title: contentStr,
            remainingTitle: "",
        };

        // 시간 문자열에서 시간 범위 추출
        const timePattern = /\d{1,2}:\d{2}/g;
        const times = timeStr.match(timePattern);

        if (times && times.length >= 1) {
            result.startTime = times[0];

            if (times.length >= 2) {
                result.endTime = times[1];
            } else {
                // 1개의 시간만 있는 경우, 내용에서 두 번째 시간을 찾아본다
                const contentTimeMatch = contentStr.match(
                    /^\s*~\s*(\d{1,2}:\d{2})/
                );
                if (contentTimeMatch) {
                    result.endTime = contentTimeMatch[1];
                    // 내용에서 시간 부분 제거
                    result.title = contentStr.replace(
                        /^\s*~\s*\d{1,2}:\d{2}\s*-?\s*/,
                        ""
                    );
                }
            }
        } else if (timeStr.match(/^\s*~\s*\d{1,2}:\d{2}/)) {
            // 시작시간 없이 ~20:00 형태만 있는 경우
            const endTimeMatch = timeStr.match(/^\s*~\s*(\d{1,2}:\d{2})/);
            if (endTimeMatch) {
                result.endTime = endTimeMatch[1];
            }
        }

        // 콘텐츠에서 ~ 기호와 시간 제거
        const cleanTitle = contentStr.replace(
            /^\s*~\s*\d{1,2}:\d{2}\s*-?\s*/,
            ""
        );

        // 시간 범위가 본문에 있는 경우 (예: "18:00 ~ 20:00 - 차유시간")
        const contentTimeRange = contentStr.match(
            /^([\d:]+)\s*~\s*([\d:]+)\s*-?\s*(.*)/
        );
        if (contentTimeRange) {
            if (!result.startTime) result.startTime = contentTimeRange[1];
            if (!result.endTime) result.endTime = contentTimeRange[2];
            result.title = contentTimeRange[3] || "";
            result.remainingTitle = "";
        } else {
            result.title = cleanTitle;
            result.remainingTitle = "";
        }

        // 제목에서 맨 앞의 '- ' 패턴 제거
        if (result.title.startsWith("- ")) {
            result.title = result.title.substring(2);
        }

        // $ 기호 제거
        result.title = result.title.replace(/^\$\s+/, "");

        return result;
    };

    // 완전히 새로운 시간 항목 컴포넌트
    const TimeItemComponent: React.FC<{ item: TimeItem }> = ({ item }) => {
        // 원본 시간 문자열과 콘텐츠 분리
        const originalTimeStr = item.time || "";

        // 제목에서 강조된 부분 추출
        const highlightedTitle = item.content.match(/\*\*(.*?)\*\*/);

        // ~ 또는 - 기호로 시간 범위가 있는지 확인하고 분리
        let startTime = "";
        let endTime = "";
        let displayTitle = item.content.replace(/^\$\s+/, ""); // 시작 부분의 $ 기호 제거
        let remainingTitle = "";

        // 시간 범위 및 콘텐츠 처리
        const timeRangeContent = processTimeAndContent(
            originalTimeStr,
            displayTitle
        );
        startTime = timeRangeContent.startTime;
        endTime = timeRangeContent.endTime;
        displayTitle = timeRangeContent.title;
        remainingTitle = timeRangeContent.remainingTitle;

        // 최종 표시할 제목 설정
        const title = highlightedTitle ? highlightedTitle[1] : displayTitle;
        const description = highlightedTitle
            ? displayTitle.replace(/\*\*(.*?)\*\*/, "").trim()
            : remainingTitle;

        // $ 기호로 시작하는 세부 항목 처리 ($ 제거)
        const processedDetails = item.details
            .map((detail) => {
                // $ 기호로 시작하는 모든 문자열 처리
                let cleaned = detail.replace(/^\$\s*/g, "").trim();

                // "추천 이유:" 라벨 제거 (뒤의 텍스트는 유지)
                cleaned = cleaned.replace(/^추천\s*이유:\s*/i, "");
                cleaned = cleaned.replace(/^추천\s*사유:\s*/i, "");
                cleaned = cleaned.replace(/^추천\s*포인트:\s*/i, "");

                return cleaned;
            })
            .filter((detail) => detail.length > 0); // 빈 문자열 제거

        return (
            <div className="py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex">
                    {/* 시간 표시 영역 - 세로로 정렬된 레이아웃 */}
                    <div className="w-16 flex-shrink-0 flex flex-col items-center pr-3">
                        {startTime && (
                            <div className="text-blue-600 font-medium mb-1">
                                {startTime}
                            </div>
                        )}
                        {endTime && (
                            <>
                                <div className="text-blue-600 font-medium my-0.5">
                                    ~
                                </div>
                                <div className="text-blue-600 font-medium mt-1">
                                    {endTime}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 내용 영역 */}
                    <div className="flex-1">
                        {/* 장소/활동명 */}
                        <div className="font-bold text-gray-800 mb-1">
                            {title}
                            {description && (
                                <span className="font-normal text-gray-700">
                                    {" "}
                                    {description}
                                </span>
                            )}
                        </div>

                        {/* 세부 항목들 */}
                        <div className="space-y-2">
                            {processedDetails.map((detail, index) => {
                                // 시계 아이콘이 있는 시간 패턴 확인
                                const clockMatch = detail.match(
                                    /^(🕓|🕙|🕛|🕑|🕕|🕔|⏰|⌚️|🕒)\s*(\d{1,2}:\d{2})/
                                );

                                // 일반 시간 패턴 확인 (시계 아이콘 없이 숫자만)
                                const timeMatch =
                                    !clockMatch &&
                                    detail.match(/^(\d{1,2}:\d{2})/);

                                // 이모지 확인
                                const hasEmoji =
                                    /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(
                                        detail
                                    );

                                if (
                                    clockMatch ||
                                    timeMatch ||
                                    detail.startsWith("⏰")
                                ) {
                                    // 시간 표시 문자열 추출
                                    const timeStr = clockMatch
                                        ? clockMatch[2]
                                        : timeMatch
                                          ? timeMatch[1]
                                          : "";

                                    // 나머지 텍스트 처리
                                    const restText = clockMatch
                                        ? detail
                                              .substring(clockMatch[0].length)
                                              .replace(/^[\s-]+/, "")
                                        : timeMatch
                                          ? detail
                                                .substring(timeMatch[0].length)
                                                .replace(/^[\s-]+/, "")
                                          : detail.replace(/^⏰\s*/, "");

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start ml-6"
                                        >
                                            <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-gray-600">
                                                {timeStr && (
                                                    <span className="font-medium mr-1">
                                                        {timeStr}
                                                    </span>
                                                )}
                                                {restText}
                                            </div>
                                        </div>
                                    );
                                } else if (hasEmoji) {
                                    // 이모지가 있는 경우 원본 텍스트 그대로 표시하되 적당한 여백 추가
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start ml-6"
                                        >
                                            <div className="text-sm text-gray-600">
                                                {detail}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // 다른 항목은 들여쓰기하여 표시 (비용 포함 모든 항목을 회색으로 표시)
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start ml-6"
                                        >
                                            <div className="text-sm text-gray-600">
                                                {detail}
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 일자 스케줄 컴포넌트
    const DayScheduleComponent: React.FC<{ day: DaySchedule }> = ({ day }) => {
        // 설명에서 $ 기호 제거
        const cleanDescription = day.description?.replace(/^\$\s+/, "") || "";

        return (
            <div className="bg-white p-4 rounded-lg">
                {/* 일자 헤더 - 있는 경우에만 표시 */}
                {day.title && day.title.includes("Day") && (
                    <div className="flex items-center mb-4 text-purple-600 pb-2 border-b border-gray-100">
                        <Calendar className="w-4 h-4 mr-2" />
                        <div className="font-medium">{day.title}</div>
                    </div>
                )}

                {/* 일자 설명 */}
                {cleanDescription && (
                    <div className="mb-4 text-sm text-gray-600">
                        {cleanDescription}
                    </div>
                )}

                {/* 시간별 아이템 */}
                <div className="relative">
                    {day.timeItems && day.timeItems.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {day.timeItems.map((item, itemIndex) => (
                                <TimeItemComponent
                                    key={itemIndex}
                                    item={item}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-3 px-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                            일정이 곧 생성될 예정입니다.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 일자별 컨텐츠 렌더링 - 수평 스크롤 방식
    const renderDaysWithHorizontalScroll = () => {
        if (!parsedItinerary.days || parsedItinerary.days.length === 0) {
            return (
                <div className="py-3 px-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    일정이 곧 생성될 예정입니다.
                </div>
            );
        }

        return (
            <div className="relative">
                {/* 일자 탭 */}
                {parsedItinerary.days.length > 1 && renderDayTabs()}

                {/* 수평 스크롤 컨테이너 */}
                <div
                    ref={scrollRef}
                    className="overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollBehavior: "smooth" }}
                    onScroll={handleScroll}
                >
                    <div className="flex">
                        {parsedItinerary.days.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className="flex-shrink-0 w-full snap-center p-1"
                            >
                                <DayScheduleComponent day={day} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 페이지 인디케이터 (점) */}
                {parsedItinerary.days.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        {parsedItinerary.days.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-colors duration-300 cursor-pointer ${
                                    activeDay === index
                                        ? "bg-purple-500"
                                        : "bg-gray-300"
                                }`}
                                onClick={() => handleDayTabClick(index)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const startDateTime = formatDateTimeComponents(suggestion.start_time);
    const endDateTime = formatDateTimeComponents(suggestion.finish_time);
    const createdDateTime = formatDateTimeComponents(suggestion.created_at);

    return (
        <div className=" w-[100%] max-w-[500px] bg-white rounded-xl overflow-y-auto max-h-[80vh] shadow-lg hide-scrollbar">
            {/* 헤더와 닫기 버튼 */}
            <div className="relative bg-purple-500 p-4 rounded-t-xl">
                <button
                    className="absolute right-3 top-3 bg-purple-500/80 backdrop-blur-sm text-white hover:bg-white/20 hover:text-purple-600 hover:scale-110 hover:rotate-90 rounded-full p-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl border border-white/30 hover:border-purple-300"
                    onClick={onClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                <h1 className="text-xl font-bold text-white text-center my-1">
                    나만의 여행 코스
                </h1>
            </div>

            {/* 내용 */}
            <div className="p-4">
                {/* 날짜/시간 및 기본 정보를 카드 형태로 표시 */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    {/* 날짜 및 시간 */}
                    <div className="flex items-center mb-2.5 pb-2.5 border-b border-gray-100">
                        <div className="bg-purple-100 rounded-full p-1.5 mr-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">
                                {startDateTime.date}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center mt-0.5">
                                <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
                                {startDateTime.time} - {endDateTime.time}
                            </div>
                        </div>
                    </div>

                    {/* 출발지 */}
                    <div className="flex items-center mb-2.5">
                        <div className="bg-purple-100 rounded-full p-1.5 mr-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-700">
                                출발지
                            </div>
                            <div className="text-xs text-gray-600">
                                {suggestion.start_place}
                            </div>
                        </div>
                    </div>

                    {/* 요청사항 */}
                    {suggestion.optional_request && (
                        <div className="flex items-start">
                            <div className="bg-purple-100 rounded-full p-1.5 mr-2 mt-0.5">
                                <Coffee className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-700">
                                    요청사항
                                </div>
                                <div className="text-xs text-gray-600">
                                    {suggestion.optional_request}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 팁 섹션 */}
                {parsedItinerary.tipSection && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4 border-l-4 border-purple-400">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-2 text-purple-600 flex items-center justify-center">
                                <TipIcon />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-purple-700 mb-0.5">
                                    Tip:
                                </div>
                                <p className="text-xs text-gray-700">
                                    {parsedItinerary.tipSection.content.replace(
                                        /^\$\s+/,
                                        ""
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 숙소 정보 */}
                {parsedItinerary.hotelInfo && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm mb-4">
                        <div className="flex items-center">
                            <div className="bg-purple-100 rounded-full p-1.5 mr-2">
                                <Home className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-700">
                                    숙소
                                </div>
                                <div className="text-xs text-gray-600">
                                    {parsedItinerary.hotelInfo.description.replace(
                                        /^\$\s+/,
                                        ""
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 일정표 헤더 */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-purple-500" />
                        일정표
                    </h3>
                    {parsedItinerary.days &&
                        parsedItinerary.days.length > 1 && (
                            <div className="text-xs text-gray-500">
                                좌우 스크롤로 일정 확인
                            </div>
                        )}
                </div>

                {/* 수평 스크롤 방식의 일자별 일정 */}
                {renderDaysWithHorizontalScroll()}

                {/* AI 추천사 섹션 - 개선된 로직으로 표시 */}
                <div className="mt-4 mb-4">
                    <div className="relative bg-gray-100 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800 mb-1">
                                    AI 추천사
                                </div>
                                <p className="text-sm text-gray-700">
                                    {aiRecommendation}
                                </p>
                            </div>
                        </div>
                        {/* 말풍선 꼬리 */}
                        <div className="absolute bottom-0 left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-100 transform translate-y-full"></div>
                    </div>
                </div>

                {/* 생성 정보 */}
                <div className="flex justify-end items-center text-xs text-gray-400 mt-3">
                    생성일: {createdDateTime.date} {createdDateTime.time}
                </div>

                {/* 확인 버튼 */}
                <button
                    className="w-full mt-5 bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors shadow-sm"
                    onClick={onClose}
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default ImprovedTravelItinerary;
