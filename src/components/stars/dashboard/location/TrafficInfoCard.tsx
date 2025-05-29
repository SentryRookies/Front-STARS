import { motion } from "framer-motion";
import { AccidentData, MapData } from "../../../../data/adminData";
import TrafficMapDemo from "../../../admin/TrafficMapComponent";

interface TrafficInfoCardProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
    mapData?: MapData;
    accidentData?: AccidentData[];
}

export default function TrafficInfoCard({
    style,
    cardRef,
    mapData,
    accidentData,
}: TrafficInfoCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-12 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            {mapData && (
                <TrafficMapDemo
                    trafficData={mapData.trafficData || undefined}
                    parkData={mapData.parkData || undefined}
                    accidentData={accidentData}
                />
            )}
        </motion.div>
    );
}
