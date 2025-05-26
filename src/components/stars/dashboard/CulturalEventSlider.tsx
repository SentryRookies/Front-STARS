import { useState } from "react";
import { motion } from "framer-motion";

interface CulturalEvent {
    title: string;
    address: string;
    start_date: string;
    end_date: string;
    event_fee?: string;
    event_img?: string;
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

    const handleNext = () => {
        if (currentIndex < events.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <motion.div
            className="col-span-12 md:col-span-6 lg:col-span-6 bg-white rounded-3xl shadow-lg p-4 my-2 relative"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <h3 className="text-lg font-bold text-lime-500 mb-3">문화행사</h3>

            <div className="relative overflow-hidden rounded-2xl">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {events.map((event, idx) => (
                        <div
                            key={idx}
                            className="min-w-full flex flex-col md:flex-row bg-gray-50 hover:bg-lime-50 rounded-2xl p-4 gap-4 min-h-[240px]"
                        >
                            {event.event_img && (
                                <img
                                    src={event.event_img}
                                    alt={event.title}
                                    className="w-full md:w-36 h-full object-cover rounded-xl"
                                />
                            )}
                            <div className="flex flex-col justify-between">
                                <h5 className="text-xl font-bold text-gray-900 mb-1">
                                    {event.title}
                                </h5>
                                <p className="text-sm text-gray-600">
                                    {event.address}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {event.start_date.slice(0, 10)} ~{" "}
                                    {event.end_date.slice(0, 10)}
                                </p>
                                {event.event_fee && (
                                    <p className="text-sm text-lime-600 mt-1">
                                        {event.event_fee}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
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
    );
}
