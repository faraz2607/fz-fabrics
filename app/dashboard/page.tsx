"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ProfileHeader from "./components/ProfileHeader";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user data, show a basic dashboard with a logout button
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully logged in. This is your dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Account
                </h3>
                <p className="text-gray-600">Manage your account settings</p>
              </div>

              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Products
                </h3>
                <p className="text-gray-600">Browse our fabric collection</p>
              </div>

              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
                <p className="text-gray-600">View your order history</p>
              </div>

              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Support
                </h3>
                <p className="text-gray-600">Get help and support</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <ProfileHeader
            user={user}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
          />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Dashboard, {user.name}!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in. This is your dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account
              </h3>
              <p className="text-gray-600">Manage your account settings</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Products
              </h3>
              <p className="text-gray-600">Browse our fabric collection</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-gray-600">View your order history</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Support
              </h3>
              <p className="text-gray-600">Get help and support</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
