// Enhanced UserInfoEdit.tsx with modern design
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UserInfo } from "../../../data/UserInfoData";
import { editUserProfile, UserProfile } from "../../../api/mypageApi";

// Props interface
interface UserInfoEditProps {
    userInfo: UserInfo;
    onPasswordValidationChange?: (isValid: boolean) => void;
    onUserInfoSubmit?: (userInfo: UserInfo) => void;
    onCancel?: () => void; // New prop for handling cancel
}

// Extended user info type (for internal state management)
interface EditableUserInfo extends UserInfo {
    new_password: string;
    _hasBeenEdited: boolean;
}

const UserInfoEdit: React.FC<UserInfoEditProps> = ({
    userInfo,
    onPasswordValidationChange,
    onUserInfoSubmit,
    onCancel,
}) => {
    // useRef to check initial mount
    const isInitialMount = useRef(true);

    // Initialize with user info
    const [editableUserInfo, setEditableUserInfo] = useState<EditableUserInfo>(
        () => ({
            ...userInfo,
            current_password: "", // Current password
            new_password: "", // New password
            chk_password: "", // Password verification
            _hasBeenEdited: false,
        })
    );

    // Whether user wants to change password
    const [wantToChangePassword, setWantToChangePassword] =
        useState<boolean>(false);

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        match: true,
        isEmpty: true,
        isValid: true,
        errorMessage: "",
    });

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Only pass initial data to parent component on first mount
    useEffect(() => {
        if (isInitialMount.current && onUserInfoSubmit) {
            isInitialMount.current = false;
        }
    }, [userInfo, onUserInfoSubmit]);

    // Password validation function
    const validatePassword = (password: string, chkPassword: string) => {
        // If user doesn't want to change password, always valid
        if (!wantToChangePassword) {
            return {
                match: true,
                isEmpty: true,
                isValid: true,
                errorMessage: "",
            };
        }

        const validation = {
            match: password === chkPassword,
            isEmpty: password.length === 0 && chkPassword.length === 0,
            isValid: false,
            errorMessage: "",
        };

        // Empty password (error only if password change is desired)
        if (validation.isEmpty) {
            validation.isValid = false;
            validation.errorMessage = "새 비밀번호를 입력해주세요.";
            return validation;
        }

        // Password format validation (min 8 chars, must include letters, numbers, special chars)
        const passwordRegex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        validation.isValid = passwordRegex.test(password);

        if (!validation.isValid) {
            validation.errorMessage =
                "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
        } else if (!validation.match) {
            validation.errorMessage = "비밀번호가 일치하지 않습니다.";
        }

        return validation;
    };

    // Password validation on change
    useEffect(() => {
        if (wantToChangePassword) {
            const validation = validatePassword(
                editableUserInfo.new_password,
                editableUserInfo.chk_password
            );
            setPasswordValidation(validation);

            // Password validity conditions:
            // 1. Password is valid and matching
            const isValidForSubmit = validation.isValid && validation.match;

            // Pass validation state to parent
            if (onPasswordValidationChange) {
                onPasswordValidationChange(isValidForSubmit);
            }
        } else {
            // If password change is not desired, always valid
            if (onPasswordValidationChange) {
                onPasswordValidationChange(true);
            }
        }
    }, [
        wantToChangePassword,
        editableUserInfo.new_password,
        editableUserInfo.chk_password,
        onPasswordValidationChange,
    ]);

    // Input change handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const updatedUserInfo = {
            ...editableUserInfo,
            [name]: value,
            _hasBeenEdited: true, // Mark as edited
        };

        setEditableUserInfo(updatedUserInfo);
    };

    // Password change checkbox handler
    const handlePasswordChangeToggle = () => {
        setWantToChangePassword(!wantToChangePassword);

        // Clear password fields when unchecking
        if (wantToChangePassword) {
            setEditableUserInfo((prev) => ({
                ...prev,
                current_password: "",
                new_password: "",
                chk_password: "",
            }));
            // Reset password validation
            setPasswordValidation({
                match: true,
                isEmpty: true,
                isValid: true,
                errorMessage: "",
            });
        }
    };

    // Submit handler
    const handleSubmit = async () => {
        // Only validate password if change is desired
        if (
            wantToChangePassword &&
            (!passwordValidation.isValid || !passwordValidation.match)
        ) {
            alert("비밀번호가 유효하지 않거나 일치하지 않습니다.");
            return;
        }

        // Check if current password is provided when changing password
        if (wantToChangePassword && editableUserInfo.current_password === "") {
            alert("현재 비밀번호를 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare data according to API requirements
            const userDataToSubmit: UserProfile = {
                user_id: editableUserInfo.user_id,
                nickname: editableUserInfo.nickname,
                birth_year: editableUserInfo.birth_year,
                mbti: editableUserInfo.mbti,
                gender: editableUserInfo.gender,
            };

            // Only add password fields if change is desired
            if (wantToChangePassword) {
                userDataToSubmit.current_password =
                    editableUserInfo.current_password;
                userDataToSubmit.new_password = editableUserInfo.new_password;
            }

            // API call to update user info
            const response = await editUserProfile(userDataToSubmit);

            if (response) {
                console.log(response);
                alert(
                    response.message || "회원 정보가 성공적으로 수정되었습니다."
                );

                // Notify parent component on success
                if (onUserInfoSubmit) {
                    onUserInfoSubmit(userInfo);
                }
            } else {
                throw new Error(
                    response?.message || "회원 정보 수정에 실패했습니다."
                );
            }
        } catch (error) {
            console.error("API error:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "회원 정보 수정 중 오류가 발생했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Password field style calculation
    const getPasswordFieldStyle = () => {
        if (!wantToChangePassword) return "border-gray-300"; // Default style if password change not wanted
        if (editableUserInfo.new_password.length === 0)
            return "border-gray-300"; // Default if empty
        return !passwordValidation.isValid
            ? "border-red-500"
            : "border-green-500";
    };

    // Password confirm field style calculation
    const getPasswordConfirmFieldStyle = () => {
        if (!wantToChangePassword) return "border-gray-300"; // Default style if password change not wanted
        if (editableUserInfo.chk_password.length === 0)
            return "border-gray-300"; // Default if empty
        return !passwordValidation.match
            ? "border-red-500"
            : "border-green-500";
    };

    // Overall form validity
    const isFormValid = wantToChangePassword
        ? passwordValidation.isValid &&
          passwordValidation.match &&
          editableUserInfo.current_password !== ""
        : true;

    // MBTI options
    const mbtiOptions = [
        "ISTJ",
        "ISFJ",
        "INFJ",
        "INTJ",
        "ISTP",
        "ISFP",
        "INFP",
        "INTP",
        "ESTP",
        "ESFP",
        "ENFP",
        "ENTP",
        "ESTJ",
        "ESFJ",
        "ENFJ",
        "ENTJ",
    ];

    // Handle cancel button click
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">✏️</span>
                회원정보 수정
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID (Readonly) */}
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        아이디
                    </label>
                    <input
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        name="user_id"
                        type="text"
                        value={editableUserInfo.user_id}
                        readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        아이디는 수정할 수 없습니다.
                    </p>
                </div>

                {/* Nickname */}
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        닉네임
                    </label>
                    <input
                        className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        name="nickname"
                        type="text"
                        value={editableUserInfo.nickname}
                        onChange={handleChange}
                    />
                </div>

                {/* Birth Year */}
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        생년월일
                    </label>
                    <input
                        className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        name="birth_year"
                        type="number"
                        value={editableUserInfo.birth_year}
                        onChange={handleChange}
                    />
                </div>

                {/* MBTI */}
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        MBTI
                    </label>
                    <select
                        className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        name="mbti"
                        value={editableUserInfo.mbti}
                        onChange={handleChange}
                    >
                        {mbtiOptions.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Gender */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        성별
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={editableUserInfo.gender === "male"}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">남성</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={editableUserInfo.gender === "female"}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">여성</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="mt-8">
                <div className="flex items-center mb-4">
                    <input
                        id="password-change-toggle"
                        type="checkbox"
                        checked={wantToChangePassword}
                        onChange={handlePasswordChangeToggle}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="password-change-toggle"
                        className="ml-2 block text-sm font-medium text-gray-700"
                    >
                        비밀번호 변경하기
                    </label>
                </div>

                {wantToChangePassword && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 space-y-4"
                    >
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                현재 비밀번호{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                name="current_password"
                                type="password"
                                value={editableUserInfo.current_password}
                                onChange={handleChange}
                                placeholder="현재 비밀번호를 입력해주세요"
                                required={wantToChangePassword}
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                새 비밀번호{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 bg-white text-gray-700 border ${getPasswordFieldStyle()} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                name="new_password"
                                type="password"
                                value={editableUserInfo.new_password}
                                onChange={handleChange}
                                placeholder="새 비밀번호를 입력해주세요"
                                required={wantToChangePassword}
                            />
                            {!passwordValidation.isValid &&
                                editableUserInfo.new_password.length > 0 && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {passwordValidation.errorMessage}
                                    </p>
                                )}
                            <p className="mt-1 text-xs text-gray-500">
                                비밀번호는 8자 이상, 영문, 숫자, 특수문자를 모두
                                포함해야 합니다.
                            </p>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                새 비밀번호 확인{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 bg-white text-gray-700 border ${getPasswordConfirmFieldStyle()} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                name="chk_password"
                                type="password"
                                value={editableUserInfo.chk_password}
                                onChange={handleChange}
                                placeholder="새 비밀번호를 다시 입력하세요"
                                required={wantToChangePassword}
                            />
                            {!passwordValidation.match &&
                                editableUserInfo.chk_password.length > 0 && (
                                    <p className="mt-1 text-xs text-red-500">
                                        비밀번호가 일치하지 않습니다.
                                    </p>
                                )}
                        </div>

                        {/* Password Status Summary */}
                        <div
                            className={`p-3 rounded-lg text-sm ${
                                !isFormValid
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                        >
                            {isFormValid ? (
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    비밀번호가 유효하며 일치합니다.
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    {editableUserInfo.current_password === ""
                                        ? "현재 비밀번호를 입력해주세요."
                                        : passwordValidation.errorMessage}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Required Field Notice */}
            <div className="mt-4 text-xs text-gray-500">
                <span className="text-red-500">*</span> 표시는 필수 입력
                항목입니다.
            </div>

            {/* Action Buttons Row - Moved both buttons inside the component */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium shadow-sm transition-colors
                        ${
                            !isFormValid || isSubmitting
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-indigo-700"
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            처리 중...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            저장하기
                        </span>
                    )}
                </button>
                <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium shadow-sm hover:bg-gray-600 transition-colors"
                >
                    <span className="flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        취소하기
                    </span>
                </button>
            </div>
        </motion.div>
    );
};

export default UserInfoEdit;
