// Enhanced UserInfoShow.tsx with Lucide React icons
import React from "react";
import { UserInfo } from "../../../data/UserInfoData";
import { formatKoreanDate } from "../../../utils/dateUtil";
import { motion } from "framer-motion";
import { User, Calendar, Cake, Brain, Users } from "lucide-react";

// Props interface
interface UserInfoShowProps {
    userInfo: UserInfo;
}

const UserInfoShow: React.FC<UserInfoShowProps> = ({ userInfo }) => {
    return (
        <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Profile header with avatar */}
            <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold mr-4">
                    {userInfo.nickname.charAt(0).toUpperCase() ||
                        userInfo.user_id.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {userInfo.nickname}
                    </h3>
                    <p className="text-sm text-gray-500">@{userInfo.user_id}</p>
                </div>
            </div>

            {/* Information cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                    icon={<User size={18} color="#3B82F6" />}
                    label="아이디"
                    value={userInfo.user_id}
                />
                <InfoItem
                    icon={<Calendar size={18} color="#10B981" />}
                    label="가입일"
                    value={formatKoreanDate(userInfo.created_at)}
                />
                <InfoItem
                    icon={<Cake size={18} color="#EF4444" />}
                    label="출생년도"
                    value={userInfo.birth_year.toString()}
                />
                <InfoItem
                    icon={<Brain size={18} color="#8B5CF6" />}
                    label="MBTI"
                    value={userInfo.mbti}
                    highlight={true}
                />
                <InfoItem
                    icon={<Users size={18} color="#F59E0B" />}
                    label="성별"
                    value={
                        userInfo.gender === "male"
                            ? "남성"
                            : userInfo.gender === "female"
                              ? "여성"
                              : "미지정"
                    }
                />
            </div>
        </motion.div>
    );
};

// Enhanced info item component with icon and potential highlight
interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({
    icon,
    label,
    value,
    highlight = false,
}) => {
    return (
        <div
            className={`p-4 rounded-lg border ${highlight ? "border-indigo-200 bg-indigo-50" : "border-gray-100 bg-gray-50"}`}
        >
            <div className="flex items-center">
                <span className="mr-2">{icon}</span>
                <span className="text-sm font-medium text-gray-500">
                    {label}
                </span>
            </div>
            <div className="mt-1 text-base font-semibold text-gray-800">
                {value}
            </div>
        </div>
    );
};

export default UserInfoShow;
