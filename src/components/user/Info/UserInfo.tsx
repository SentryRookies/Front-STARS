// Enhanced UserInfo.tsx to tie both UserInfoShow and UserInfoEdit
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserInfoShow from "./UserInfoShow";
import UserInfoEdit from "./UserInfoEdit";

import { UserInfo as UserInfoType } from "../../../data/UserInfoData";
import { getUserProfile } from "../../../api/mypageApi";
import { signoutUser } from "../../../api/authApi";
import useCustomLogin from "../../../hooks/useCustomLogin";
import { isAdmin } from "../../../slices/loginSlice";

const initialUserData: UserInfoType = {
    member_id: "",
    user_id: "",
    nickname: "",
    current_password: "",
    chk_password: "",
    birth_year: 0,
    mbti: "",
    gender: "",
    created_at: "",
};

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

// 계정 삭제 확인 모달 컴포넌트
const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
}: DeleteConfirmModalProps) => {
    const [inputValue, setInputValue] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const confirmText = "계정삭제";

    const handleFirstConfirm = () => {
        setCurrentStep(2);
        setInputValue("");
    };

    const handleSecondConfirm = () => {
        if (inputValue === confirmText) {
            onConfirm();
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setInputValue("");
        onClose();
    };

    const isValidInput = inputValue === confirmText;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            >
                <AnimatePresence mode="wait">
                    {currentStep === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="text-center"
                        >
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                계정 삭제 확인
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                정말로 계정을 삭제하시겠습니까?
                                <br />
                                <span className="font-semibold text-red-600">
                                    이 작업은 되돌릴 수 없습니다.
                                </span>
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={handleClose}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                    onClick={handleFirstConfirm}
                                >
                                    계속 진행
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="text-center"
                        >
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                최종 확인
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                계정 삭제를 확정하려면 아래에
                                <span className="font-bold text-red-600">
                                    {" "}
                                    {confirmText}{" "}
                                </span>
                                를 정확히 입력해주세요.
                            </p>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className={`w-full p-3 border rounded-lg mb-4 focus:outline-none text-center font-medium text-black ${
                                    inputValue && !isValidInput
                                        ? "border-red-500 bg-red-50"
                                        : isValidInput
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-300 bg-white"
                                }`}
                                placeholder={confirmText}
                                disabled={isSubmitting}
                            />
                            {inputValue && !isValidInput && (
                                <p className="text-red-500 text-sm mb-4">
                                    정확히 "{confirmText}"를 입력해주세요.
                                </p>
                            )}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                        isValidInput && !isSubmitting
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                    onClick={handleSecondConfirm}
                                    disabled={!isValidInput || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            삭제 중...
                                        </span>
                                    ) : (
                                        "계정 삭제"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const UserInfo = () => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserInfoType | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // 모달 상태 추가

    const { doLogout, moveToPath } = useCustomLogin();
    const adminCheck = isAdmin();

    // Load user info
    const loadUserInfo = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getUserProfile();

            if (response) {
                setUserData(response);
            } else {
                setError("사용자 정보를 불러오는데 실패했습니다.");
                setUserData(initialUserData);
            }
        } catch (err) {
            console.warn(err);
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            setUserData(initialUserData);
        } finally {
            setIsLoading(false);
        }
    };

    // Load user data on component mount
    useEffect(() => {
        loadUserInfo();
    }, []);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    // Handle user info submit after edit
    const handleUserInfoSubmit = () => {
        setEditMode(false);
        loadUserInfo();
    };

    // Account deletion handler - 모달 열기로 변경
    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    // 실제 계정 삭제 처리 함수
    const handleConfirmDelete = async () => {
        setIsSubmitting(true);

        try {
            const response = await signoutUser(userData?.member_id);

            if (response === "회원 탈퇴가 완료되었습니다.") {
                alert("계정이 성공적으로 삭제되었습니다.");
                setShowDeleteModal(false);
                doLogout();
                moveToPath("/");
            } else {
                alert(response.message || "계정 삭제에 실패했습니다.");
            }
        } catch (err) {
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            console.warn(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Admin page navigation handler
    const handleGoToAdminPage = () => {
        moveToPath("/manage");
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="p-4 rounded-lg border border-gray-100 bg-gray-50"
                            >
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-5 bg-gray-200 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error display
    if (error) {
        return (
            <div className="bg-white rounded-lg p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-5 rounded-lg flex flex-col items-center">
                    <svg
                        className="w-12 h-12 text-red-500 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">오류 발생</h3>
                    <p className="text-center mb-4">{error}</p>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={loadUserInfo}
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!editMode ? (
                    <motion.div
                        key="show"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <UserInfoShow userInfo={userData || initialUserData} />
                        {/* Action buttons for view mode */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                className="w-full sm:w-auto bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center"
                                onClick={handleEditToggle}
                                disabled={isSubmitting}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                수정하기
                            </button>

                            {adminCheck && (
                                <button
                                    className="w-full sm:w-auto bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center"
                                    onClick={handleGoToAdminPage}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    관리자 페이지
                                </button>
                            )}

                            <button
                                className="w-full sm:w-auto bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center"
                                onClick={handleDeleteAccount}
                                disabled={isSubmitting}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                계정 삭제
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Pass onCancel prop to UserInfoEdit */}
                        <UserInfoEdit
                            userInfo={userData || initialUserData}
                            onUserInfoSubmit={handleUserInfoSubmit}
                            onCancel={handleEditToggle}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 계정 삭제 확인 모달 */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default UserInfo;
