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
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function CulturalEventCard({
    event,
    style,
    cardRef,
}: CulturalEventCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-purple-500 rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <p className="text-md text-gray-200">문화행사</p>
            <p className="text-2xl font-bold text-white">{event.title}</p>
            <p className="text-sm text-gray-100 mt-1">{event.address}</p>
            <p className="text-sm text-gray-100 mt-1">
                {event.start_date.slice(0, 10)} ~ {event.end_date.slice(0, 10)}
            </p>
            {event.event_fee && (
                <p className="text-sm text-yellow-100 mt-1">
                    {event.event_fee}
                </p>
            )}
            {event.event_img && (
                <img
                    src={event.event_img}
                    alt={event.title}
                    className="w-32 object-cover rounded-xl shadow-lg mt-2"
                />
            )}
        </motion.div>
    );
}
