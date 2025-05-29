import { SearchResult } from "../api/searchApi";
import { addFavorite, deleteFavorite } from "../api/mypageApi";

const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    cultural_event: "문화행사",
    culturalevent: "문화행사",
};

const categoryBadge: Record<string, string> = {
    accommodation: "bg-blue-100 text-blue-700",
    attraction: "bg-green-100 text-green-700",
    cafe: "bg-yellow-100 text-yellow-700",
    restaurant: "bg-red-100 text-red-700",
    cultural_event: "bg-purple-100 text-purple-700",
    culturalevent: "bg-purple-100 text-purple-700",
};

export function renderPopupHTML(item: SearchResult, isFavorite: boolean) {
    const placeId: string | number = item.id ?? item.place_id;
    const badge = categoryBadge[item.type] ?? "bg-gray-100 text-gray-700";
    const label = categoryMap[item.type] ?? item.type;
    const starBtnHtml =
        item.type !== "cultural_event" && item.type !== "culturalevent"
            ? `
        <button class="favorite-btn bg-white rounded-full shadow-md p-2" data-type="${item.type}" data-place-id="${placeId}">
            ${
                isFavorite
                    ? `<svg class="w-4 h-4 text-yellow-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20">
                           <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                       </svg>`
                    : `<svg class="w-4 h-4 text-gray-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20">
                           <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                       </svg>`
            }
        </button>
    `
            : "";
    const phoneHtml = item.phone
        ? `<div class="text-sm text-gray-500">
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:#6b7280;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <a href="tel:${item.phone.replace(/[^0-9]/g, "")}" class="text-gray-700 hover:text-blue-600 hover:underline" style="word-break:break-all;">${item.phone}</a>
                </span>
            </div>`
        : "";
    const kakaoHtml = item.kakaomap_url
        ? `<a
                href="${item.kakaomap_url}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오맵에서 보기"
                style="display: inline-block;"
            >
                <img
                    src="/kakaoMap.png"
                    alt="카카오맵에서 보기"
                    style="width:36px; height: auto; display: inline-block;"
                />
            </a>`
        : "";

    const naverHtml = item.name
        ? `<a
                href="https://map.naver.com/p/search/${encodeURIComponent(item.name)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="네이버지도에서 보기"
                style="display: inline-block; margin-left: 8px;"
            >
                <img
                    src="/naverMap.png"
                    alt="네이버지도"
                    style="width:36px; height: auto; display:inline-block;"
                />
            </a>`
        : "";
    return `
            <div class="flex flex-col p-2 gap-1">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="font-bold text-xl text-gray-700">${item.name}</h3>
                    <span class="inline-flex w-auto px-2 py-1 rounded-full text-xs font-semibold ${badge}">${label}</span>
                    ${starBtnHtml}
                </div>
                <p class="text-gray-700">${item.address}</p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${kakaoHtml}
                    ${naverHtml}
                </div>
                ${phoneHtml}
                <div class="flex justify-center">
                    <button class="mt-2 px-3 py-1 max-w-[180px] w-full bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition detail-btn" data-area-id="${item.area_id ?? ""}">
                        가까운 지역구 보기
                    </button>
                </div>            
            </div>
        `;
}

interface BindPopupEventsParams {
    popup: mapboxgl.Popup;
    item: SearchResult;
    isLogin: boolean;
    isItemFavorite: (type: string, place_id: string | number) => boolean;
    setAlertMessage: (msg: string) => void;
    setAlertType: (type: "success" | "remove") => void;
    setAlertOpen: (open: boolean) => void;
    setToggledFavorites: (
        fn: (prev: Record<string, boolean>) => Record<string, boolean>
    ) => void;
    getItemKey: (type: string, place_id: string | number) => string;
    setSelectedAreaId: (areaId: number) => void;
    setShowFocusCard: (show: boolean) => void;
}

export function bindPopupEvents({
    popup,
    item,
    isLogin,
    isItemFavorite,
    setAlertMessage,
    setAlertType,
    setAlertOpen,
    setToggledFavorites,
    getItemKey,
    setSelectedAreaId,
    setShowFocusCard,
}: BindPopupEventsParams) {
    const popupEl = popup.getElement();
    if (!popupEl) return;

    const favBtn = popupEl.querySelector(".favorite-btn");
    if (favBtn) {
        let isToggled = isItemFavorite(item.type, item.place_id);
        const updateButtonUI = (toggled: boolean) => {
            const svg = favBtn.querySelector("svg");
            if (!svg) return;
            if (toggled) {
                svg.classList.add("text-yellow-300");
                svg.classList.remove("text-gray-300");
            } else {
                svg.classList.add("text-gray-300");
                svg.classList.remove("text-yellow-300");
            }
        };
        updateButtonUI(isToggled);
        favBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!isLogin) {
                alert("즐겨찾기 기능은 로그인 후 이용 가능합니다.");
                return;
            }
            isToggled = !isToggled;
            updateButtonUI(isToggled);
            try {
                if (isToggled) {
                    await addFavorite({
                        type: item.type,
                        place_id: item.place_id,
                    });
                    setAlertMessage("즐겨찾기에 추가되었습니다.");
                    setAlertType("success");
                    setAlertOpen(true);
                } else {
                    await deleteFavorite({
                        type: item.type,
                        place_id: item.place_id,
                    });
                    setAlertMessage("즐겨찾기에서 제거되었습니다.");
                    setAlertType("remove");
                    setAlertOpen(true);
                }
                const key = getItemKey(item.type, item.place_id);
                setToggledFavorites((prev) => ({
                    ...prev,
                    [key]: isToggled,
                }));
            } catch (error) {
                isToggled = !isToggled;
                console.error("즐겨찾기 처리 중 오류 발생:", error);
                updateButtonUI(isToggled);
            }
        });
    }
    const detailBtn = popupEl.querySelector(".detail-btn");
    if (detailBtn) {
        detailBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const areaId = item.area_id;
            if (areaId) {
                setSelectedAreaId(areaId);
                setShowFocusCard(true);
            }
        });
    }
}
