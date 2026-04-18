"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Dropdown from "@/app/components/Dropdown";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import CustomDateRangePicker from "@/app/components/CustomDateRangePicker";
import { DEFAULT_THREAD_TYPES, COLOR_MAP, DATE_RANGE_OPTIONS } from "../dashboard/constants";
import AddThreadModal from "../dashboard/components/AddThreadModal";
import TableSkeleton from "@/app/components/TableSkeleton";
import NoDataFound from "@/app/components/NoDataFound";

interface Thread {
  id: string;
  type: string;
  color: string;
  cost: number;
  date: string;
}

export default function ThreadPage() {
  const { user, loading } = useCurrentUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [threadDetailsToDelete, setThreadDetailsToDelete] = useState<Thread | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("last-month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

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
        setThreads(data.sort((a: Thread, b: Thread) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const handleAddThread = async (newThread: Omit<Thread, "id">) => {
    setThreadError(null);
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThread),
      });
      if (response.ok) {
        const thread = await response.json();
        setThreads([...threads, thread]);
        setShowModal(false);
      } else {
        setThreadError("Failed to add thread. Please try again.");
      }
    } catch {
      setThreadError("Failed to add thread. Please try again.");
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
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/threads/${threadToDelete}`, { method: "DELETE" });
      if (response.ok) {
        setThreads(threads.filter((thread) => thread.id !== threadToDelete));
      } else {
        setThreadError("Failed to delete thread. Please try again.");
      }
    } catch {
      setThreadError("Failed to delete thread. Please try again.");
    } finally {
      setIsDeleting(false);
      setThreadToDelete(null);
      setThreadDetailsToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const getFilteredThreads = () => {
    let filteredThreads = threads;

    if (filterType !== "all") {
      filteredThreads = filteredThreads.filter(
        (thread) => thread.type === filterType,
      );
    }

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 font-medium">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm px-3 py-2.5 sm:px-5 sm:py-4 flex flex-wrap items-end justify-between gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
        >
          + Add Thread
        </button>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Dropdown
            label=""
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: "all", label: "All Types" },
              ...DEFAULT_THREAD_TYPES.map((type) => ({ value: type, label: type })),
            ]}
            minWidth="min-w-36 sm:min-w-44"
          />
          <div className="relative">
            <Dropdown
              label=""
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setShowCustomDatePicker(value === "custom");
              }}
              options={DATE_RANGE_OPTIONS}
              minWidth="min-w-36 sm:min-w-44"
            />
            {dateRange === "custom" && (
              <CustomDateRangePicker
                startDate={customDateRange.startDate}
                endDate={customDateRange.endDate}
                onStartDateChange={(date) => setCustomDateRange((prev) => ({ ...prev, startDate: date }))}
                onEndDateChange={(date) => setCustomDateRange((prev) => ({ ...prev, endDate: date }))}
                isOpen={showCustomDatePicker}
                onClose={() => setShowCustomDatePicker(false)}
                trigger={<div></div>}
              />
            )}
          </div>
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2.5 sm:px-5 sm:py-4 border-b border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Threads List</h3>
          {threadError && <p className="mt-1.5 sm:mt-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">{threadError}</p>}
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-16rem)]">
          {isLoadingThreads ? (
            <div className="p-3 sm:p-5">
              <TableSkeleton rows={6} cols={5} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-linear-to-r from-blue-50 to-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getFilteredThreads().length === 0 ? (
                  <tr><td colSpan={5}><NoDataFound title="No threads found" description="Try adjusting your filters or add a new thread." /></td></tr>
                ) : (
                  getFilteredThreads().map((thread, idx) => (
                    <tr key={thread.id} className={`transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">{thread.type}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300" style={{ backgroundColor: COLOR_MAP[thread.color] || '#000000' }} />
                          <span className="text-gray-700">{thread.color}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">₹{thread.cost.toFixed(2)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500">{new Date(thread.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        <button onClick={() => handleDeleteThread(thread.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddThreadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddThread={handleAddThread}
        threadTypes={DEFAULT_THREAD_TYPES}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setThreadDetailsToDelete(null); }}
        onConfirm={confirmDeleteThread}
        title="Confirm Deletion"
        message="Are you sure you want to delete this thread? This action cannot be undone."
        confirmText="Delete Thread"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        threadDetails={
          threadDetailsToDelete
            ? { type: threadDetailsToDelete.type, color: threadDetailsToDelete.color, date: threadDetailsToDelete.date }
            : undefined
        }
      />
    </div>
  );
}
