// TravelItineraryTypes.ts
export interface TimeItem {
  time: string;
  content: string;
  details: string[];
}

export interface DaySchedule {
  title: string;
  description: string;
  timeItems: TimeItem[];
}

export interface TipSection {
  content: string;
}

export interface HotelInfo {
  description: string;
}

export interface ParsedItinerary {
  tipSection?: TipSection;
  hotelInfo?: HotelInfo;
  days: DaySchedule[];
  additionalInfos: string[];
}