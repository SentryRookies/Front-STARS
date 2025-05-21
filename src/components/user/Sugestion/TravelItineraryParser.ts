// TravelItineraryParser.ts

import { ParsedItinerary, DaySchedule, TimeItem } from './TravelItineraryTypes';

// 이모지 처리 함수
function improveEmojiHandling(text: string): string {
  // 이모지 앞에 $ 기호가 붙는 패턴 감지 (유니코드 이모지 범위 사용)
  return text.replace(/\$([\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu, '$1');
}

// 달러 기호 제거 함수 추가
function removeDollarSign(text: string): string {
  return text.replace(/^\$\s*/g, '').replace(/\$\s*/g, '');
}

export function parseItineraryFromMarkdown(markdownText: string): ParsedItinerary {
  if (!markdownText || markdownText.trim() === '') {
    return { days: [], additionalInfos: [] };
  }

  // 줄별로 분리
  const lines = markdownText.split('\n').filter(line => line.trim() !== '');
  
  // 결과 구조체 초기화
  const result: ParsedItinerary = {
    days: [],
    additionalInfos: []
  };

  // 패턴 정의
  const tipPattern = /^📌\s*Tip:(.*)$/;
  const schedulePattern = /^⏰\s*일정표.*/i;
  const hotelPattern = /^🏨\s*숙소:(.*)$/;
  const dayPattern = /^📅\s*Day\s*\d+\s*-\s*(.*)/i;
  
  // 모든 시간 이모지를 포함하도록 패턴 수정
  const timePattern = /^(🕓|🕙|🕛|🕑|🕕|🕔|🕠|🕞|🕗|🕘|🕚|🕖|⏰)?\s*(\d{1,2}:\d{2})\s*(.*)$/;
  const subItemPattern = /^\s*-\s*(.*)/;
  const separatorPattern = /^---$/;

  // 현재 처리 중인 컨텍스트
  let currentDay: DaySchedule | null = null;
  let currentTimeItem: TimeItem | null = null;

  // 텍스트 파싱
  for (let i = 0; i < lines.length; i++) {
    // 이모지 앞의 $ 기호 처리 및 모든 $ 기호 제거
    const line = removeDollarSign(improveEmojiHandling(lines[i].trim()));

    // 팁 섹션 확인
    const tipMatch = line.match(tipPattern);
    if (tipMatch) {
      // 다음 몇 줄도 팁에 포함될 수 있음
      let j = i + 1;
      let tipContent = tipMatch[1].trim();
      
      while (j < lines.length && 
             !lines[j].match(schedulePattern) && 
             !lines[j].match(hotelPattern) && 
             !lines[j].match(dayPattern)) {
        // 이모지 처리 및 $ 기호 제거
        tipContent += ' ' + removeDollarSign(improveEmojiHandling(lines[j].trim()));
        j++;
      }
      
      result.tipSection = { content: tipContent };
      i = j - 1; // 다음 처리할 라인으로 인덱스 이동
      continue;
    }

    // 일정표 라인은 스킵
    if (line.match(schedulePattern)) {
      continue;
    }

    // 숙소 정보 확인
    const hotelMatch = line.match(hotelPattern);
    if (hotelMatch) {
      try {
        // 대시(-)를 제거하고 전체 텍스트를 설명으로 사용
        const fullHotelInfo = hotelMatch[1] ? hotelMatch[1].trim() : "";
        const addressPart = fullHotelInfo.includes(' - ') ? 
          fullHotelInfo.split(' - ')[0] : fullHotelInfo;
        
        // 이모지 처리 및 $ 기호 제거
        result.hotelInfo = {
          description: removeDollarSign(improveEmojiHandling(addressPart))
        };
      } catch (err) {
        console.error('숙소 정보 파싱 오류:', err);
        // 오류가 발생해도 기본값 설정
        result.hotelInfo = {
          description: "숙소 정보를 파싱하는 중 오류가 발생했습니다."
        };
      }
      continue;
    }

    // 구분선은 스킵
    if (line.match(separatorPattern)) {
      continue;
    }

    // Day 확인
    const dayMatch = line.match(dayPattern);
    if (dayMatch) {
      currentDay = {
        title: line.replace(/^📅\s*/, ''), // 이모지 제거
        description: removeDollarSign(improveEmojiHandling(dayMatch[1].trim())), // 이모지 처리 및 $ 기호 제거
        timeItems: []
      };
      result.days.push(currentDay);
      currentTimeItem = null;
      continue;
    }

    // 시간 항목 확인 - 모든 시간 패턴 통합
    const timeMatch = line.match(timePattern);
    if (timeMatch) {
      // 현재 Day가 없으면 생성
      if (!currentDay) {
        currentDay = {
          title: "일정표",
          description: "",
          timeItems: []
        };
        result.days.push(currentDay);
      }
      
      // 시간은 좌측에 표시하기 위해 이모지 제거 및 시간만 추출
      const timeOnly = timeMatch[2].trim();
      const contentOnly = removeDollarSign(improveEmojiHandling(timeMatch[3].trim())); // 이모지 처리 및 $ 기호 제거
      
      currentTimeItem = {
        time: timeOnly,
        content: contentOnly,
        details: []
      };
      currentDay.timeItems.push(currentTimeItem);
      continue;
    }

    // 세부 항목 확인
    const subItemMatch = line.match(subItemPattern);
    if (subItemMatch && currentTimeItem) {
      // 이모지는 유지하고 세부 내용 추가
      let detail = removeDollarSign(improveEmojiHandling(subItemMatch[1].trim())); // 이모지 처리 및 $ 기호 제거
      
      // 시간 형식이 들어있는 항목 확인 (🕔 18:00~20:00 등)
      const timeInDetailMatch = detail.match(/^(🕓|🕙|🕛|🕑|🕕|🕔|🕠|🕞|🕗|🕘|🕚|🕖|⏰)?\s*(\d{1,2}:\d{2}.*?)$/);
      if (timeInDetailMatch) {
        // 시간 형식이 있는 항목은 그대로 유지
        currentTimeItem.details.push(detail);
      } else {
        // 다른 이모지가 있는 항목 처리
        currentTimeItem.details.push(detail);
      }
      continue;
    }

    // 기타 텍스트는 현재 day나 timeItem에 추가하거나 추가 정보로 처리
    if (currentTimeItem) {
      // 이모지 처리 및 $ 기호 제거
      currentTimeItem.details.push(removeDollarSign(improveEmojiHandling(line)));
    } else if (currentDay) {
      if (!currentDay.description) {
        currentDay.description = removeDollarSign(improveEmojiHandling(line)); // 이모지 처리 및 $ 기호 제거
      } else {
        currentDay.description += " " + removeDollarSign(improveEmojiHandling(line)); // 이모지 처리 및 $ 기호 제거
      }
    } else {
      // 이모지 처리 및 $ 기호 제거
      result.additionalInfos.push(removeDollarSign(improveEmojiHandling(line)));
    }
  }

  return result;
}
