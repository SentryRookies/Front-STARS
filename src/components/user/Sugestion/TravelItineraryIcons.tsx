import React from 'react';
import { Clock, MapPin, Calendar, DollarSign, MoreHorizontal, Home, Info, Coffee } from 'lucide-react';
import { TimeItem, DaySchedule, TipSection, HotelInfo, ParsedItinerary } from './TravelItineraryTypes';

// 아이콘 컴포넌트
export const TipIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-purple-600" }) => (
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

export const TransportIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-blue-600" }) => (
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
        <path d="M8 6v6" />
        <path d="M15 6v6" />
        <path d="M2 12h19.6" />
        <rect width="18" height="8" x="2" y="14" rx="2" />
        <path d="M9 14v8" />
        <path d="M14 14v8" />
        <path d="M20 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6h17V6z" />
    </svg>
);

export const WalkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-indigo-600" }) => (
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
        <path d="M13 4v16" />
        <path d="M17 4v16" />
        <path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </svg>
);

export const FoodIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-orange-600" }) => (
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
        <path d="M7 13h10v1a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v6Z" />
        <path d="M10 2v5" />
        <path d="M15 2v5" />
        <path d="M18 6.94a6.44 6.44 0 0 1 3 6.06V13h-5.5" />
    </svg>
);

export const ParkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-green-600" }) => (
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
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56A2 2 0 0 1 4 10h12a2 2 0 0 1 2 0 2 2 0 0 1 .4 3H14l1 4.12a2 2 0 0 1-1.84 2.76A2 2 0 0 1 11 18.12" />
    </svg>
);

export const TaxiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-yellow-600" }) => (
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
        <path d="M6 8v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8l-6-3z" />
        <path d="M4 11h16" />
        <path d="M10 6h4" />
    </svg>
);

export const TicketIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-pink-600" }) => (
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
        <path d="M20 12v8H4v-8" />
        <path d="M20 6v6H4V6" />
        <path d="m15 3 2 3H7l2-3" />
    </svg>
);

// 키워드에 따라 아이콘을 반환하는 함수 - 비용 관련 아이콘만 표시하도록 수정
export function getIconByKeyword(text: string): React.ReactElement {
    const lowerText = text.toLowerCase();

    // 비용 관련 키워드만 확인하고 나머지는 빈 요소 반환
    if (lowerText.includes('비용') || lowerText.includes('원')) {
        return <DollarSign className="w-4 h-4 text-green-600" />;
    } else {
        // 빈 요소 반환 (아이콘 표시하지 않음)
        return <></>;
    }
}

// 이모지 맵핑
export const emojiToIcon: Record<string, React.ReactElement> = {
    '📌': <TipIcon />,
    '⏰': <Clock className="w-4 h-4 text-blue-600" />,
    '🏨': <Home className="w-4 h-4 text-indigo-600" />,
    '📅': <Calendar className="w-4 h-4 text-purple-600" />,
    '🕓': <Clock className="w-4 h-4 text-blue-600" />,
    '🕙': <Clock className="w-4 h-4 text-blue-600" />,
    '🕛': <Clock className="w-4 h-4 text-blue-600" />,
    '🕑': <Clock className="w-4 h-4 text-blue-600" />,
    '🕕': <Clock className="w-4 h-4 text-blue-600" />,
    '🕔': <Clock className="w-4 h-4 text-blue-600" />,
    '🚇': <TransportIcon />,
    '🚶': <WalkIcon />,
    '🚕': <TaxiIcon />,
    '🎫': <TicketIcon />,
    '🍽️': <FoodIcon />
};

// 스크롤바 숨기기 위한 스타일 (전역 CSS 파일에 추가하거나 필요에 따라 인라인 스타일로 사용)
export const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE 및 Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;