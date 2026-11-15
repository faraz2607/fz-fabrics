"use client";

import { useState } from "react";
import Link from "next/link";
import type { ValidationError } from "@/lib/validation";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailAccepted, setEmailAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const parsed: Record<string, string> = {};
          (data.errors as ValidationError[]).forEach((item) => { parsed[item.field] = item.message; });
          setFieldErrors(parsed);
        } else setError(data.error || "Could not start password reset.");
        return;
      }
      setEmailAccepted(true);
    } catch {
      setError("Could not start password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitNewPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const parsed: Record<string, string> = {};
          (data.errors as ValidationError[]).forEach((item) => { parsed[item.field] = item.message; });
          setFieldErrors(parsed);
        } else setError(data.error || "Could not reset your password.");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError("Could not reset your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6">
        <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Password reset successful</h1>
        <p className="mb-5 rounded border border-green-300 bg-green-50 p-4 text-sm text-green-800">Your password has been reset successfully. You can now sign in with your new password.</p>
        <Link href="/auth/login" className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Click here to log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6">
      <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Reset password</h1>
      <p className="mb-5 text-sm text-gray-600">{emailAccepted ? "Choose a new password for your account." : "Enter your account email to check whether password reset is enabled."}</p>
      {error && <p role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!emailAccepted ? (
        <form onSubmit={submitEmail} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
            <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={isLoading} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="you@example.com" />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-blue-700 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{isLoading ? "Checking…" : "Continue"}</button>
        </form>
      ) : (
        <form onSubmit={submitNewPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">New password</label>
            <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required disabled={isLoading} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
            <p className="mt-1 text-xs text-gray-500">Use at least 8 characters, with an uppercase letter, a number, and a special character.</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required disabled={isLoading} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-blue-700 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{isLoading ? "Resetting…" : "Save new password"}</button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-gray-600">Remember your password? <Link href="/auth/login" className="font-medium text-blue-700 hover:underline">Log in</Link></p>
    </div>
  );
}
