import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react"; // 아이콘 사용

interface FavoriteToastAlertProps {
    open: boolean;
    message: string;
    type?: "success" | "remove";
    onClose: () => void;
    duration?: number;
}

const FavoriteToastAlert: React.FC<FavoriteToastAlertProps> = ({
    open,
    message,
    type = "success",
    onClose,
    duration = 2500,
}) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [open, duration, onClose]);

    const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
    const borderColor =
        type === "success" ? "border-green-200" : "border-red-200";
    const textColor = type === "success" ? "text-green-700" : "text-red-700";
    const Icon = type === "success" ? CheckCircle : XCircle;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`fixed top-6 inset-x-0 z-50 mx-auto w-fit px-6 py-3 rounded-xl border shadow-lg flex items-center space-x-2 ${bgColor} ${borderColor}`}
                >
                    <Icon className={`w-5 h-5 ${textColor}`} />
                    <div className={`text-base font-semibold ${textColor}`}>
                        {message}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FavoriteToastAlert;
