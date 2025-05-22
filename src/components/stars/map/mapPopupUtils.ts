import { SearchResult } from "../../../api/searchApi";

// Category mappings
export const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    cultural_event: "문화행사",
    culturalevent: "문화행사",
};

export const categoryBadge: Record<string, string> = {
    accommodation: "bg-blue-100 text-blue-700",
    attraction: "bg-green-100 text-green-700",
    cafe: "bg-yellow-100 text-yellow-700",
    restaurant: "bg-red-100 text-red-700",
    cultural_event: "bg-purple-100 text-purple-700",
    culturalevent: "bg-purple-100 text-purple-700",
};

/**
 * mapbox 팝업용 HTML 문자열을 생성하는 함수
 * @param item - 검색 결과 아이템
 * @param isFavorite - 즐겨찾기 여부
 * @returns 팝업에 사용할 HTML 문자열
 */
export const createPopupHTML = (
    item: SearchResult,
    isFavorite: boolean
): string => {
    const placeId: string | number = item.place_id ?? item.place_id;
    const badge = categoryBadge[item.type] ?? "bg-gray-100 text-gray-700";
    const label = categoryMap[item.type] ?? item.type;
    const isEventType =
        item.type === "cultural_event" || item.type === "culturalevent";

    const starBtnHtml = isEventType
        ? ""
        : `
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
  `;

    const phoneHtml = item.phone
        ? `<div class="text-sm text-gray-500">전화: ${item.phone}</div>`
        : `<div class="text-sm text-gray-500">전화: 정보 없음</div>`;

    const kakaoHtml = item.kakaomap_url
        ? `<button class="mt-1 text-xs px-2 py-1 bg-[#FEE500] text-[#3C1E1E] font-bold rounded shadow hover:bg-yellow-300 transition" onclick="window.open('${item.kakaomap_url}', '_blank')">카카오맵에서 보기</button>`
        : `<div class="text-sm text-gray-500"></div>`;

    return `
    <div class="flex flex-col p-2 gap-2">
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-xl text-gray-700">${item.name}</h3>
        <span class="inline-flex w-auto px-2 py-1 rounded-full text-xs font-semibold ${badge}">${label}</span>
        ${starBtnHtml}
      </div>
      <p class="text-gray-700">${item.address}</p>
      ${phoneHtml}
      ${kakaoHtml}
      <button class="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition detail-btn" data-area-id="${item.area_id ?? ""}">가까운 지역구 보기</button>*/
    </div>
  `;
};
