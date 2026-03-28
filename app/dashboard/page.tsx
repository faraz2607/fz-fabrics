"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Header from "@/app/components/TabHeader";
import Dropdown from "@/app/components/Dropdown";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import CustomDateRangePicker from "@/app/components/CustomDateRangePicker";
import ThreadChart from "./components/ThreadChart";
import AddThreadModal from "./components/AddThreadModal";
import {
  DEFAULT_THREAD_TYPES,
  COLOR_MAP,
  DATE_RANGE_OPTIONS,
} from "./constants";

export interface Thread {
  id: string;
  type: string;
  color: string;
  cost: number;
  date: string;
}

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [threadDetailsToDelete, setThreadDetailsToDelete] =
    useState<Thread | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("last-month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Fetch threads from database on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchThreads();
    }
  }, [user?.id]);

  const fetchThreads = async () => {
    try {
      setIsLoadingThreads(true);
      const response = await fetch("/api/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const handleAddThread = async (newThread: Omit<Thread, "id">) => {
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newThread),
      });

      if (response.ok) {
        const thread = await response.json();
        setThreads([...threads, thread]);
        setShowModal(false);
      } else {
        alert("Failed to add thread");
      }
    } catch (error) {
      console.error("Failed to add thread:", error);
      alert("Failed to add thread");
    }
  };

  const handleDeleteThread = (id: string) => {
    const thread = threads.find((t) => t.id === id);
    if (thread) {
      setThreadToDelete(id);
      setThreadDetailsToDelete(thread);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteThread = async () => {
    if (!threadToDelete) return;

    try {
      const response = await fetch(`/api/threads/${threadToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setThreads(threads.filter((thread) => thread.id !== threadToDelete));
      } else {
        alert("Failed to delete thread");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Failed to delete thread");
    } finally {
      setThreadToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Date filtering logic
  const getFilteredThreads = () => {
    let filteredThreads = threads;

    // Filter by thread type
    if (filterType !== "all") {
      filteredThreads = filteredThreads.filter(
        (thread) => thread.type === filterType,
      );
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      if (dateRange === "custom") {
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          const endDate = new Date(customDateRange.endDate);
          filteredThreads = filteredThreads.filter((thread) => {
            const threadDate = new Date(thread.date);
            return threadDate >= startDate && threadDate <= endDate;
          });
        }
      } else {
        const option = DATE_RANGE_OPTIONS.find(
          (opt) => opt.value === dateRange,
        );
        if (option && option.days) {
          startDate = new Date(
            now.getTime() - option.days * 24 * 60 * 60 * 1000,
          );
          filteredThreads = filteredThreads.filter((thread) => {
            const threadDate = new Date(thread.date);
            return threadDate >= startDate;
          });
        }
      }
    }

    return filteredThreads;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user data, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">
            Please log in to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section with Filter and Add Button */}
      <div className="w-full bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            + Add Thread
          </button>

          {/* Filter Section */}
          <div className="flex gap-4">
            <Dropdown
              label="Filter by Thread Type"
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: "all", label: "All Types" },
                ...DEFAULT_THREAD_TYPES.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
              minWidth="min-w-48"
            />
            <div className="relative">
              <Dropdown
                label="Filter by Date Range"
                value={dateRange}
                onChange={(value) => {
                  setDateRange(value);
                  if (value === "custom") {
                    setShowCustomDatePicker(true);
                  } else {
                    setShowCustomDatePicker(false);
                  }
                }}
                options={DATE_RANGE_OPTIONS}
                minWidth="min-w-48"
              />
              {dateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  onStartDateChange={(date) =>
                    setCustomDateRange((prev) => ({ ...prev, startDate: date }))
                  }
                  onEndDateChange={(date) =>
                    setCustomDateRange((prev) => ({ ...prev, endDate: date }))
                  }
                  isOpen={showCustomDatePicker}
                  onClose={() => setShowCustomDatePicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-12">
        {/* Content Section - Chart and Table Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-4">Cost Trend</h3>
            {isLoadingThreads ? (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Loading chart...</p>
              </div>
            ) : (
              <ThreadChart threads={getFilteredThreads()} />
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-black">Threads List</h3>
            </div>
            <div className="overflow-x-auto overflow-y-auto h-96">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                      Color
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                      Cost (₹)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredThreads().length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No threads found for the selected filters. Try adjusting
                        your filters or add a new thread!
                      </td>
                    </tr>
                  ) : (
                    getFilteredThreads().map((thread) => (
                      <tr
                        key={thread.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {thread.type}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{
                                backgroundColor:
                                  COLOR_MAP[thread.color] || "#000000",
                              }}
                            ></div>
                            <span className="text-gray-900">
                              {thread.color}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">
                          ₹{thread.cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {new Date(thread.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <button
                            onClick={() => handleDeleteThread(thread.id)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AddThreadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddThread={handleAddThread}
        threadTypes={DEFAULT_THREAD_TYPES}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setThreadDetailsToDelete(null);
        }}
        onConfirm={confirmDeleteThread}
        title="Confirm Deletion"
        message="Are you sure you want to delete this thread? This action cannot be undone."
        confirmText="Delete Thread"
        cancelText="Cancel"
        type="danger"
        threadDetails={
          threadDetailsToDelete
            ? {
                type: threadDetailsToDelete.type,
                color: threadDetailsToDelete.color,
                date: threadDetailsToDelete.date,
              }
            : undefined
        }
      />
    </div>
  );
}
