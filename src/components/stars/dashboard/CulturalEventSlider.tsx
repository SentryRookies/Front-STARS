import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePlace } from "../../../context/PlaceContext";
import { SearchResult } from "../../../api/searchApi";
import ModalPortal from "../dashboard/ModalPortal"; // 🔸 위치에 맞게 경로 수정

interface CulturalEvent {
    name: string;
    address: string;
    category: string;
    target: string;
    start_date: string;
    end_date: string;
    event_fee?: string;
    event_img?: string;
    lat: number;
    lon: number;
}

interface CulturalEventSliderProps {
    events: CulturalEvent[];
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function CulturalEventSlider({
    events,
    style,
    cardRef,
}: CulturalEventSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { setHighlightPOI, selectedAreaId } = usePlace();
    const [modalImg, setModalImg] = useState<string | null>(null);

    const handleNext = () => {
        if (currentIndex < events.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    return (
        <>
            <motion.div
                className="col-span-12 md:col-span-6 lg:col-span-6 bg-white rounded-3xl shadow-lg p-4 my-2 relative"
                whileHover={{ y: -6 }}
                animate={style}
                style={style}
                ref={cardRef}
            >
                <h3 className="text-lg font-bold text-lime-500 mb-3">
                    문화행사
                </h3>

                <div className="relative overflow-hidden rounded-2xl">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {events.map((event, idx) => {
                            const poiForMap: SearchResult = {
                                place_id: idx + 1,
                                name: event.name,
                                address: event.address,
                                phone: "",
                                lon: event.lon,
                                lat: event.lat,
                                type: "cultural_event",
                                area_id: selectedAreaId ?? undefined,
                            };

                            return (
                                <div
                                    key={idx}
                                    className="min-w-full flex flex-col md:flex-row bg-gray-50 hover:bg-lime-50 rounded-2xl p-4 gap-4 min-h-[240px] cursor-pointer"
                                    onClick={() => {
                                        setHighlightPOI(poiForMap);
                                        (
                                            window as unknown as {
                                                fullpage_api?: {
                                                    moveTo: (n: number) => void;
                                                };
                                            }
                                        ).fullpage_api?.moveTo(1);
                                    }}
                                >
                                    {event.event_img && (
                                        <img
                                            src={event.event_img}
                                            alt={event.name}
                                            className="w-full md:w-36 h-full object-cover rounded-xl cursor-zoom-in"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalImg(event.event_img!);
                                            }}
                                        />
                                    )}
                                    <div className="flex flex-col justify-between">
                                        <h5 className="text-lg font-bold text-gray-900 mb-1">
                                            {event.name}
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                            {event.category} | {event.target}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {event.address}
                                            <br />
                                            {event.start_date.slice(
                                                0,
                                                10
                                            )} ~ {event.end_date.slice(0, 10)}
                                        </p>
                                        {event.event_fee && (
                                            <p className="text-xs text-lime-600 mt-1">
                                                {event.event_fee}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 인디케이터 */}
                <div className="flex justify-center items-center gap-1 mb-2">
                    {events.map((_, idx) => (
                        <span
                            key={idx}
                            className={`w-1.5 h-1.5 mt-2 rounded-full transition-all duration-300 ${
                                idx === currentIndex
                                    ? "bg-lime-500 scale-110"
                                    : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>

                {/* 버튼 */}
                <div className="flex justify-between mt-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50"
                    >
                        ← 이전
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === events.length - 1}
                        className="px-3 py-1 bg-lime-500 text-white rounded-full hover:bg-lime-600 disabled:opacity-50"
                    >
                        다음 →
                    </button>
                </div>
            </motion.div>

            {/* 이미지 모달: Portal로 이동 */}
            <AnimatePresence>
                {modalImg && (
                    <ModalPortal>
                        <motion.div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                            onClick={() => setModalImg(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.img
                                src={modalImg}
                                alt="이벤트 이미지"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl border-4 border-white"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>
        </>
    );
}
