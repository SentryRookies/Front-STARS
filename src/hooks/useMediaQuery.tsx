// src/hooks/useMediaQuery.tsx

import { useState, useEffect } from "react";

/**
 * 미디어 쿼리를 추적하는 커스텀 훅
 * @param query 감시할 미디어 쿼리 (예: '(max-width: 768px)')
 * @returns 쿼리와 일치하는지 여부 (boolean)
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // 이벤트 리스너 등록
        mediaQuery.addEventListener("change", handler);

        // 클린업 함수
        return () => {
            mediaQuery.removeEventListener("change", handler);
        };
    }, [query]);

    return matches;
}
