// CulturalEventCard.tsx
import { motion } from "framer-motion";
import React from "react";

interface CulturalEvent {
    title: string;
    address: string;
    start_date: string;
    end_date: string;
    event_fee?: string;
    event_img?: string;
}

interface CulturalEventCardProps {
    event: CulturalEvent;
}

export default function CulturalEventCard({ event }: CulturalEventCardProps) {
    return (
        <motion.a
            href="#"
            className="snap-start flex-none w-[90%] md:w-[500px] bg-white border border-gray-200 rounded-3xl shadow hover:bg-gray-100 transition flex overflow-hidden"
            whileHover={{ y: -6 }}
        >
            {event.event_img && (
                <img
                    src={event.event_img}
                    alt={event.title}
                    className="w-40 h-40 object-cover rounded-l-3xl"
                />
            )}
            <div className="p-4 flex flex-col justify-between">
                <h5 className="text-xl font-bold text-gray-800 mb-1">
                    {event.title}
                </h5>
                <p className="text-sm text-gray-600">{event.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                    {event.start_date.slice(0, 10)} ~{" "}
                    {event.end_date.slice(0, 10)}
                </p>
                {event.event_fee && (
                    <p className="text-xs font-medium text-indigo-600 mt-1">
                        💸 {event.event_fee}
                    </p>
                )}
            </div>
        </motion.a>
    );
}
