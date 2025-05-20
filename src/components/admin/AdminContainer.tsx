// src/components/admin/AdminContainer.tsx
import React, { useEffect } from "react";
import { AdminDataProvider } from "../../context/AdminContext";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminComponent from "./AdminComponent";
import AdminDetail from "./AdminDetail";
import AdminTour from "./AdminTour";
import AdminUserFavorite from "./AdminUserFavorite";
import AdminTraffic from "./AdminTraffic";
import { initializeAppHeight } from "../../utils/setAppHeight";

const AdminContainer: React.FC = () => {
    useEffect(() => {
        // 아래에 추가
        initializeAppHeight();
    }, []);

    return (
        <AdminDataProvider>
            <Routes>
                {/* 중첩 라우팅 처리 */}
                <Route path="/" element={<AdminComponent />} />
                <Route path="/:spotCode" element={<AdminDetail />} />
                <Route path="/tour" element={<AdminTour />} />
                <Route path="/user" element={<AdminUserFavorite />} />
                <Route path="/traffic" element={<AdminTraffic />} />
                {/* 기본 리다이렉션 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AdminDataProvider>
    );
};

export default AdminContainer;
