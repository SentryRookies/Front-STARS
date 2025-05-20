import React from "react";
import { UserFavoriteList } from "../../../data/adminData";

interface UserListProps {
    users: UserFavoriteList[];
    loading: boolean;
    selectedUserId: string | null;
    onSelect: (userId: string) => void;
    getUserColor: (userId: string) => string;
    SkeletonItem?: React.ComponentType;
    skeletonCount?: number;
}

const DefaultSkeleton = () => (
    <div className="p-3 border-b animate-pulse">
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    </div>
);

export default function UserList({
    users,
    loading,
    selectedUserId,
    onSelect,
    getUserColor,
    SkeletonItem = DefaultSkeleton,
    skeletonCount = 5,
}: UserListProps) {
    return (
        <div
            className="overflow-y-auto flex-1"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {loading ? (
                [...Array(skeletonCount)].map((_, idx) => (
                    <SkeletonItem key={idx} />
                ))
            ) : users.length > 0 ? (
                users.map((user) => (
                    <div
                        key={user.user_id}
                        className={`p-3 border-b cursor-pointer text-black hover:bg-gray-100 transition-colors ${
                            selectedUserId === user.user_id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => onSelect(user.user_id)}
                    >
                        <div className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${getUserColor(
                                    user.user_id
                                )}`}
                            >
                                {user.user_id
                                    ? user.user_id.charAt(0).toUpperCase()
                                    : "?"}
                            </div>
                            <div>
                                <div className="font-medium">
                                    @{user.user_id}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    즐겨찾기 {user.content.length}개
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-gray-500">
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    );
}
