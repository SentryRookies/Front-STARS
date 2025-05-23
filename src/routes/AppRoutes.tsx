// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import FullPageLayout from "../layouts/FullPageLayout";
import AdminContainer from "../components/admin/AdminContainer";
import AdminComponent from "../components/admin/AdminComponent";
import AdminDetail from "../components/admin/AdminDetail";
import AdminTour from "../components/admin/AdminTour";
import AdminUserFavorite from "../components/admin/AdminUserFavorite";
import LoginPage from "../pages/login/LoginPage";
import AdminTraffic from "../components/admin/AdminTraffic";
import Test from "../components/test/test";
import AdminUserManagement from "../components/admin/AdminUserManage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* 홈페이지 리다이렉트 to /map */}
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<FullPageLayout />} />
            <Route path="/login" element={<LoginPage />} />

            {/* AdminContainer를 부모 라우트로 설정하고, 그 아래에 중첩 라우트 구성 */}
            <Route path="/manage" element={<AdminContainer />}>
                <Route index element={<AdminComponent />} />
                <Route path=":spotCode" element={<AdminDetail />} />
                <Route path="tour" element={<AdminTour />} />
                <Route path="favorite" element={<AdminUserFavorite />} />
                <Route path="traffic" element={<AdminTraffic />} />
                <Route path="user" element={<AdminUserManagement />} />
            </Route>

            <Route path="test" element={<Test />} />
        </Routes>
    );
}
