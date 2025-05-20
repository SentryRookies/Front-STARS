import { useState, useEffect } from 'react';
import {createUserSuggestion} from '../../../api/suggestionApi';

import { UserInfo as UserInfoType } from "../../../data/UserInfoData";
import { Suggestion } from './PlaceSuggestionShow';

type UserPlaceSuggestionProps = {
  userData: UserInfoType | null;
  setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setSuggestionResult:React.Dispatch<React.SetStateAction<Suggestion>>;
};


export default function UserPlaceSuggestion({
  userData,
  setShowResult,
  setIsCreate,
  setSuggestionResult
} : UserPlaceSuggestionProps){
  
  const [questionType, setQuestionType] = useState(0);
  const [startPlace, setStartPlace] = useState('');
  const [optionalRequest, setOptionalRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  
  // 시간 블록 선택기를 위한 상태
  const [timePeriod, setTimePeriod] = useState(0); // 0: 오전, 1: 오후
  const [selectedHour, setSelectedHour] = useState(''); // 빈 문자열로 변경
  const [selectedMinute, setSelectedMinute] = useState(''); // 빈 문자열로 변경
  const [displayTime, setDisplayTime] = useState('');
  
  // 날짜 선택기를 위한 상태
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');

  // 오전/오후 시간 옵션
  const timeOptions = [
    ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'], // 오전 (0-11시)
    ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'], // 오후 (12-23시)
  ];
  
  // 분 옵션 (00분과 30분)
  const minuteOptions = ['00', '30'];
  
  // 월 이름 배열
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  
  // 요일 이름 배열
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 컴포넌트가 마운트될 때 오늘 날짜 설정 및 날짜 초기화
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    setTodayDate(todayString);
    
    // 현재 시간에 따라 기본 시간대 설정
    const currentHour = today.getHours();
    if (currentHour < 12) {
      setTimePeriod(0); // 오전
    } else {
      setTimePeriod(1); // 오후
    }
    
    // 모든 여행 유형에서 초기값 비우기
    setStartTime('');
    setFinishTime('');
    setDisplayTime('');
    setSelectedHour('');
    setSelectedMinute('');
    setStartDate(null);
    setEndDate(null);
  }, [questionType]);
  
  // 시간과 분이 선택될 때마다 표시 시간과 startTime 업데이트
  useEffect(() => {
    if (selectedHour && selectedMinute) {
      updateDisplayTime(selectedHour, selectedMinute);
    }
  }, [selectedHour, selectedMinute]);
  
  // 표시 시간 업데이트 및 startTime 설정
  const updateDisplayTime = (hour: string, minute: string) => {
    const formattedTime = `${hour}:${minute}`;
    setDisplayTime(formattedTime);
    
    // 오늘 여행이고 실제로 시간이 선택된 경우에만 startTime 설정
    if (questionType === 0 && hour && minute) {
      setStartTime(formattedTime);
    }
  };

  // 선택한 날짜를 문자열로 변환 (YYYY-MM-DD)
  const formatDateToString = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜와 시간을 합쳐서 ISO 형식으로 변환 (YYYY-MM-DDTHH:MM)
  const combineDateTimeToISO = (date: Date | null, time: string): string => {
    if (!date) return '';
    const dateStr = formatDateToString(date);
    const timeStr = time || '00:00';
    return `${dateStr}T${timeStr}`;
  };

  // startDate가 변경될 때마다 startTime 업데이트
  useEffect(() => {
    if (questionType > 0 && startDate) {
      const timeStr = startTime.split('T')[1] || '00:00';
      setStartTime(combineDateTimeToISO(startDate, timeStr));
    }
  }, [startDate, questionType]);

  // endDate가 변경될 때마다 finishTime 업데이트
  useEffect(() => {
    if (questionType > 0 && endDate) {
      const timeStr = finishTime.split('T')[1] || '00:00';
      setFinishTime(combineDateTimeToISO(endDate, timeStr));
    }
  }, [endDate, questionType]);

  // 현재 월의 날짜 생성
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  // 이전 달의 마지막 날짜들 (첫 주 채우기)
  const getLastDaysOfPrevMonth = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    if (firstDayOfMonth === 0) return []; // 일요일부터 시작하면 필요 없음
    
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.unshift(new Date(year, month - 1, lastDayOfPrevMonth - i));
    }
    
    return days;
  };

  // 다음 달의 첫 날짜들 (마지막 주 채우기)
  const getFirstDaysOfNextMonth = (year: number, month: number) => {
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastDayOfWeek = lastDayOfMonth.getDay();
    
    if (lastDayOfWeek === 6) return []; // 토요일에 끝나면 필요 없음
    
    const days = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 날짜가 범위 내에 있는지 확인
  const isInRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    const time = day.getTime();
    return time > startDate.getTime() && time < endDate.getTime();
  };

  // 날짜 클릭 핸들러 (출발일)
  const handleStartDateClick = (day: Date) => {
    setStartDate(day);
    setShowStartCalendar(false);
    
    // 종료일이 출발일보다 이전이면 종료일도 같은 날로 설정
    if (endDate && day > endDate) {
      setEndDate(day);
    }
  };

  // 날짜 클릭 핸들러 (종료일)
  const handleEndDateClick = (day: Date) => {
    // 출발일이 없거나 선택한 날짜가 출발일보다 이전이면 출발일도 변경
    if (!startDate || day < startDate) {
      setStartDate(day);
      setEndDate(day);
    } else {
      setEndDate(day);
    }
    setShowEndCalendar(false);
  };

  // 캘린더 렌더링 함수
  const renderCalendar = (forStartDate = true) => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const prevMonthDays = getLastDaysOfPrevMonth(currentYear, currentMonth);
    const nextMonthDays = getFirstDaysOfNextMonth(currentYear, currentMonth);
    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
    const today = new Date();
    const handleDateClick = forStartDate ? handleStartDateClick : handleEndDateClick;
    
    return (
      <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">{currentYear}년 {monthNames[currentMonth]}</h3>
          <div className="flex gap-1">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelectedStartDate = startDate && day.toDateString() === startDate.toDateString();
            const isSelectedEndDate = endDate && day.toDateString() === endDate.toDateString();
            const isToday = day.getDate() === today.getDate() && 
                           day.getMonth() === today.getMonth() && 
                           day.getFullYear() === today.getFullYear();
            const isRangeDay = isInRange(day);
            
            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  w-8 h-8 text-xs rounded-md flex items-center justify-center
                  ${!isCurrentMonth ? 'text-gray-300 cursor-default' : 'text-gray-700 hover:bg-gray-100'}
                  ${isRangeDay ? 'bg-purple-100' : ''}
                  ${isSelectedStartDate ? 'bg-purple-500 text-white' : ''}
                  ${isSelectedEndDate ? 'bg-purple-500 text-white' : ''}
                  ${isToday && !isSelectedStartDate && !isSelectedEndDate ? 'border border-purple-500 font-medium' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        
        <div className="mt-2 flex justify-end">
          <button 
            onClick={() => forStartDate ? setShowStartCalendar(false) : setShowEndCalendar(false)}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1"
          >
            닫기
          </button>
        </div>
      </div>
    );
  };

  // 날짜를 한국어 형식으로 포맷팅 (yyyy년 mm월 dd일)
  const formatDateKR = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // 여기에 API 호출 또는 상태 관리 로직 추가
    const requestData = {
      question_type: questionType,
      start_time: questionType === 0 ? `${todayDate}T${startTime}` : startTime,
      finish_time: finishTime,
      start_place: startPlace,
      optional_request: optionalRequest
    };
    
    console.log('제출된 데이터:', requestData);
    // 제출 후 로직...
    

      try {
          const response = await createUserSuggestion(userData?.user_id,requestData);
          if (response) {
              console.log(response);
              setSuggestionResult(response)
          } else {
                  response.message ||
                      "여행 루트 추천 생성 실패"
          }
        } catch (err) {
          console.log(err)
        }finally{
          setIsCreate(false);
          setShowResult(true);
        }

    
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  // 여행 유형별 설명 텍스트
  const typeDescriptions = [
    "오늘의 혼잡도 예측을 기준으로 한산한 장소를 추천합니다",
    "원하는 날짜의 당일치기 여행 코스를 추천합니다",
    "숙박이 포함된 여행 코스를 추천합니다"
  ];

  return (
    <div>
        
        <h2 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">나만의 여행 코스 추천</h2>
        <p className="text-xs text-gray-500 text-center mb-4">당신의 여행 스타일에 맞는 코스를 추천해 드립니다</p>

        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex overflow-x-auto snap-x scrollbar-hide space-x-2">
              {['오늘 여행', '일정 여행', '숙박 여행'].map((type, index) => (
                <div 
                  key={index}
                  onClick={() => setQuestionType(index)}
                  className={`snap-start shrink-0 w-[105px] h-22 rounded-xl p-3 flex flex-col justify-start gap-5 transition-all duration-200 cursor-pointer border-2 ${
                    questionType === index
                      ? 'border-purple-500 shadow-md shadow-purple-100'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-bold ${questionType === index ? 'text-purple-600' : 'text-gray-700'}`}>
                    {type}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">
                    {index === 0 && "혼잡도 기반 추천"}
                    {index === 1 && "날짜 지정 코스"}
                    {index === 2 && "1박 이상 코스"}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-600 px-1">
              {typeDescriptions[questionType]}
            </p>
          </div>
          
          <div className="space-y-4 p-3 bg-gray-50 rounded-xl">
            <div className="space-y-2">
              <label htmlFor="startPlace" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {questionType === 2 ? '숙소 위치' : '출발 위치'}
              </label>
              <input
                id="startPlace"
                type="text"
                value={startPlace}
                onChange={(e) => setStartPlace(e.target.value)}
                placeholder={questionType === 2 ? '숙소 주소를 입력하세요' : '출발지 주소를 입력하세요 (도로명 주소)'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {questionType === 0 ? '여행 시작 시간' : '출발 날짜/시간'}
              </label>
              
              {/* 오늘 여행일 경우 시간 블록 선택기 표시 */}
              {questionType === 0 ? (
                <div className="bg-white rounded-lg border border-gray-100 p-2">
                  {/* 오전/오후 선택 */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['오전', '오후'].map((period, idx) => (
                      <div
                        key={idx}
                        onClick={() => setTimePeriod(idx)}
                        className={`text-center py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                          timePeriod === idx 
                            ? 'bg-purple-100 text-purple-600 font-medium' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                  
                  {/* 시간 선택 - 시간 그리드 */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1 px-1">시간</div>
                    <div className="grid grid-cols-4 gap-2">
                      {timeOptions[timePeriod].map((hour, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedHour(hour)}
                          className={`text-center py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedHour === hour 
                              ? 'bg-purple-500 text-white font-medium' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {hour}시
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 분 선택 */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1 px-1">분</div>
                    <div className="grid grid-cols-2 gap-2">
                      {minuteOptions.map((minute, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedMinute(minute)}
                          className={`text-center py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedMinute === minute 
                              ? 'bg-purple-500 text-white font-medium' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {minute}분
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 선택된 시간 표시 */}
                  {displayTime && (
                    <div className="text-center mt-2 p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">선택된 시간</div>
                      <div className="text-base font-medium text-purple-600">{displayTime}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div 
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => {
                      setShowStartCalendar(!showStartCalendar);
                      setShowEndCalendar(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">출발 날짜</div>
                        <div className="text-sm font-medium">
                          {startDate ? formatDateKR(startDate) : '날짜를 선택하세요'}
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* 캘린더 팝업 */}
                  {showStartCalendar && renderCalendar(true)}
                  
                  {/* 시간 선택 (날짜가 선택된 경우에만 표시) */}
                  {startDate && (
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 p-2">
                      <div className="flex justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600">출발 시간</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {/* 시간 선택 */}
                        <div className="flex-1">
                          <select
                            value={startTime.split('T')[1]?.split(':')[0] || ''}
                            onChange={(e) => {
                              const hour = e.target.value;
                              const minute = startTime.split('T')[1]?.split(':')[1] || '00';
                              const dateStr = formatDateToString(startDate);
                              setStartTime(`${dateStr}T${hour}:${minute}`);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">시간</option>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                              <option key={hour} value={hour}>{hour}시</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* 분 선택 */}
                        <div className="flex-1">
                          <select
                            value={startTime.split('T')[1]?.split(':')[1] || ''}
                            onChange={(e) => {
                              const minute = e.target.value;
                              const hour = startTime.split('T')[1]?.split(':')[0] || '00';
                              const dateStr = formatDateToString(startDate);
                              setStartTime(`${dateStr}T${hour}:${minute}`);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">분</option>
                            {['00', '30'].map(minute => (
                              <option key={minute} value={minute}>{minute}분</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {questionType === 0 && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  {todayDate ? `오늘(${todayDate.replace(/-/g, '.')}) 기준으로 추천됩니다` : '오늘 날짜 기준으로 추천됩니다'}
                </p>
              )}
            </div>
            
            {questionType > 0 && (
              <div className="space-y-2">
                <label htmlFor="finishTime" className="block text-sm font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {questionType === 1 ? '여행 종료 시간' : '귀가 날짜/시간'}
                </label>
                
                <div className="relative">
                  <div 
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => {
                      setShowEndCalendar(!showEndCalendar);
                      setShowStartCalendar(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">종료 날짜</div>
                        <div className="text-sm font-medium">
                          {endDate ? formatDateKR(endDate) : '날짜를 선택하세요'}
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* 캘린더 팝업 */}
                  {showEndCalendar && renderCalendar(false)}
                  
                  {/* 시간 선택 (날짜가 선택된 경우에만 표시) */}
                  {endDate && (
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 p-2">
                      <div className="flex justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600">종료 시간</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {/* 시간 선택 */}
                        <div className="flex-1">
                          <select
                            value={finishTime.split('T')[1]?.split(':')[0] || ''}
                            onChange={(e) => {
                              const hour = e.target.value;
                              const minute = finishTime.split('T')[1]?.split(':')[1] || '00';
                              const dateStr = formatDateToString(endDate);
                              setFinishTime(`${dateStr}T${hour}:${minute}`);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">시간</option>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                              <option key={hour} value={hour}>{hour}시</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* 분 선택 */}
                        <div className="flex-1">
                          <select
                            value={finishTime.split('T')[1]?.split(':')[1] || ''}
                            onChange={(e) => {
                              const minute = e.target.value;
                              const hour = finishTime.split('T')[1]?.split(':')[0] || '00';
                              const dateStr = formatDateToString(endDate);
                              setFinishTime(`${dateStr}T${hour}:${minute}`);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">분</option>
                            {['00', '30'].map(minute => (
                              <option key={minute} value={minute}>{minute}분</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 날짜 범위 요약 표시 */}
                {startDate && endDate && (
                  <div className="mt-2 bg-purple-50 p-2 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">선택한 여행 기간</div>
                    <div className="text-sm font-medium flex justify-between">
                      <span>{formatDateKR(startDate)} ~ {formatDateKR(endDate)}</span>
                      <span className="text-purple-600">
                        {Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1)}일
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 빠른 날짜 선택 버튼 (일정 여행, 숙박 여행인 경우만 표시) */}
            {questionType > 0 && (
              <div className="pt-2">
                <div className="text-xs text-gray-500 mb-2">빠른 날짜 선택</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setStartDate(today);
                      const end = new Date(today);
                      end.setDate(today.getDate() + (questionType === 1 ? 0 : 1));
                      setEndDate(end);
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs hover:bg-gray-50"
                  >
                    {questionType === 1 ? '오늘 당일' : '오늘~내일'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(today.getDate() + 1);
                      setStartDate(tomorrow);
                      const end = new Date(tomorrow);
                      end.setDate(tomorrow.getDate() + (questionType === 1 ? 0 : 1));
                      setEndDate(end);
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs hover:bg-gray-50"
                  >
                    {questionType === 1 ? '내일 당일' : '내일~모레'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const start = new Date(today);
                      start.setDate(today.getDate() + (today.getDay() === 6 ? 7 : 6 - today.getDay()));
                      setStartDate(start);
                      const end = new Date(start);
                      end.setDate(start.getDate() + (questionType === 1 ? 0 : 1));
                      setEndDate(end);
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs hover:bg-gray-50"
                  >
                    {questionType === 1 ? '이번주 토요일' : '주말'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="optionalRequest" className="block text-sm font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              원하는 여행 스타일 (선택)
            </label>
            <textarea
              id="optionalRequest"
              value={optionalRequest}
              onChange={(e) => setOptionalRequest(e.target.value)}
              placeholder="예: 카페 위주로 추천해주세요, 도보 이동 위주 등"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (questionType > 0 && (!startDate || !endDate))}
            className={`w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg transition-all duration-300 shadow-md 
              ${isSubmitting || (questionType > 0 && (!startDate || !endDate)) ? 
                'opacity-70 cursor-not-allowed' : 
                'hover:from-purple-700 hover:to-blue-600'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                추천 중...
              </span>
            ) : (
              '맞춤 코스 추천받기'
            )}
          </button>
        </div>
    </div>       
  );
}