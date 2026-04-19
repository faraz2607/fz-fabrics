"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
import type { ValidationError } from "@/lib/validation";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ErrorState {
  [key: string]: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [formState, setFormState] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};

    // Current password validation
    if (!formState.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // New password validation
    if (!formState.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else {
      if (formState.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters long";
      } else if (!/[A-Z]/.test(formState.newPassword)) {
        newErrors.newPassword = "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(formState.newPassword)) {
        newErrors.newPassword = "Password must contain at least one number";
      } else if (!/[!@#$%^&*]/.test(formState.newPassword)) {
        newErrors.newPassword = "Password must contain at least one special character (!@#$%^&*)";
      }
    }

    // Confirm password validation
    if (!formState.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formState.newPassword !== formState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is same as current
    if (formState.currentPassword && formState.newPassword && 
        formState.currentPassword === formState.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Prevent spaces in password fields
    if (value.includes(' ')) {
      return;
    }

    setFormState((prev) => ({ ...prev, [name]: value }));

    // Update password requirements in real-time
    if (name === "newPassword") {
      setPasswordRequirements({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value),
      });
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setGeneralError("");
    setErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formState),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        setGeneralError("Invalid response from server. Please try again.");
        return;
      }

      if (!response.ok) {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const errorMap: ErrorState = {};
          (data.errors as ValidationError[]).forEach((error) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        } else if (data.error) {
          setGeneralError(data.error);
        } else {
          // Handle different HTTP status codes
          switch (response.status) {
            case 400:
              setGeneralError("Invalid input. Please check your passwords and try again.");
              break;
            case 401:
              setGeneralError("You are not authorized. Please log in again.");
              break;
            case 404:
              setGeneralError("User account not found. Please log in again.");
              break;
            case 500:
              setGeneralError("Server error. Please try again later.");
              break;
            default:
              setGeneralError("An unexpected error occurred. Please try again.");
          }
        }
        return;
      }

      // Success
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error("Network error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setGeneralError("Network error. Please check your connection and try again.");
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setGeneralError("");
    setIsSuccess(false);
    setPasswordRequirements({
      length: false,
      uppercase: false,
      number: false,
      special: false,
    });
    onClose();
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Password Changed">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-600 font-medium mb-2">Password changed successfully!</p>
          <p className="text-gray-600 text-sm">Your account is now more secure.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {generalError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Current Password *
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formState.currentPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${
              errors.currentPassword ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
            placeholder="Enter your current password"
            disabled={isLoading}
            autoComplete="current-password"
            maxLength={128}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            New Password *
          </label>
          <input
            type="password"
            name="newPassword"
            value={formState.newPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${
              errors.newPassword ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
            placeholder="Enter your new password"
            disabled={isLoading}
            autoComplete="new-password"
            maxLength={128}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.newPassword}
            </p>
          )}

          {formState.newPassword && (
            <div className="mt-2 text-xs space-y-1">
              <p className="text-gray-600 font-medium mb-1">Password requirements:</p>
              <div className="grid grid-cols-2 gap-1">
                <p className={`flex items-center gap-1 ${
                  passwordRequirements.length ? "text-green-600" : "text-gray-500"
                }`}>
                  <span className={passwordRequirements.length ? "text-green-500" : "text-gray-400"}>✓</span>
                  8+ characters
                </p>
                <p className={`flex items-center gap-1 ${
                  passwordRequirements.uppercase ? "text-green-600" : "text-gray-500"
                }`}>
                  <span className={passwordRequirements.uppercase ? "text-green-500" : "text-gray-400"}>✓</span>
                  Uppercase letter
                </p>
                <p className={`flex items-center gap-1 ${
                  passwordRequirements.number ? "text-green-600" : "text-gray-500"
                }`}>
                  <span className={passwordRequirements.number ? "text-green-500" : "text-gray-400"}>✓</span>
                  Number
                </p>
                <p className={`flex items-center gap-1 ${
                  passwordRequirements.special ? "text-green-600" : "text-gray-500"
                }`}>
                  <span className={passwordRequirements.special ? "text-green-500" : "text-gray-400"}>✓</span>
                  Special character
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Confirm New Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${
              errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
            placeholder="Confirm your new password"
            disabled={isLoading}
            autoComplete="new-password"
            maxLength={128}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || !formState.currentPassword || !formState.newPassword || !formState.confirmPassword}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}