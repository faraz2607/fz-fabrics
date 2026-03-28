"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ValidationError } from "@/lib/validation";

interface FormState {
  email: string;
}

interface ErrorState {
  [key: string]: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ErrorState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMap: ErrorState = {};
          (data.errors as ValidationError[]).forEach((error) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        }
        return;
      }

      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-black">
          Check Your Email
        </h1>
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>
            If an account exists with <strong>{email}</strong>, you will receive
            a password reset link.
          </p>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Click the link in the email to reset your password. The link will expire
          in 1 hour.
        </p>
        <Link
          href="/auth/login"
          className="text-blue-700 hover:underline text-sm"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Forgot Password
      </h1>

      <p className="text-gray-600 text-sm mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p>
          Remember your password?{" "}
          <Link href="/auth/login" className="text-blue-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
