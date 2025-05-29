import { useState, useEffect } from "react";

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
