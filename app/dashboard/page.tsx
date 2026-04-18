"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Header from "@/app/components/TabHeader";
import Dropdown from "@/app/components/Dropdown";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import CustomDateRangePicker from "@/app/components/CustomDateRangePicker";
import ThreadChart from "./components/ThreadChart";
import EmployeeEarningsBarChart from "./components/EmployeeEarningsBarChart";
import FabricCountBarChart from "./components/FabricCountBarChart";
// Employee earnings state
import { DEFAULT_THREAD_TYPES, COLOR_MAP, DATE_RANGE_OPTIONS } from "./constants";
import AddThreadModal from "./components/AddThreadModal";
import TableSkeleton from "@/app/components/TableSkeleton";
import NoDataFound from "@/app/components/NoDataFound";

interface Thread {
  id: string;
  type: string;
  color: string;
  cost: number;
  date: string;
}

interface EmployeeEarning {
  employeeId: string;
  employeeName: string;
  earning: number;
  count: number;
}

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  // Employee earnings state
  const [earnings, setEarnings] = useState<EmployeeEarning[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Fabric count by type state
  interface FabricCount { type: string; count: number; }
  const [fabricCounts, setFabricCounts] = useState<FabricCount[]>([]);
  const [fabricCountsLoading, setFabricCountsLoading] = useState(false);

  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return {
      start: monday.toISOString().slice(0, 10) + 'T00:00:00.000Z',
      end: today.toISOString().slice(0, 10) + 'T23:59:59.999Z',
    };
  };
  const currentWeek = getCurrentWeekRange();

  // Earnings filter state
  const [earningsDateRange, setEarningsDateRange] = useState<string>("current");
  const [earningsStart, setEarningsStart] = useState<string>(currentWeek.start);
  const [earningsEnd, setEarningsEnd] = useState<string>(currentWeek.end);
  const [earningsCustomRange, setEarningsCustomRange] = useState({ startDate: "", endDate: "" });
  const [showEarningsCustomPicker, setShowEarningsCustomPicker] = useState(false);

  // Fabric counts filter state
  const [fabricCountsDateRange, setFabricCountsDateRange] = useState<string>("current");
  const [fabricCountsStart, setFabricCountsStart] = useState<string>(currentWeek.start);
  const [fabricCountsEnd, setFabricCountsEnd] = useState<string>(currentWeek.end);
  const [fabricCountsCustomRange, setFabricCountsCustomRange] = useState({ startDate: "", endDate: "" });
  const [showFabricCountsCustomPicker, setShowFabricCountsCustomPicker] = useState(false);

  const fetchEarnings = async (start: string, end: string) => {
    setEarningsLoading(true);
    try {
      const res = await fetch(`/api/employee-earnings?start=${start}&end=${end}`);
      if (res.ok) setEarnings(await res.json());
    } catch { setEarnings([]); } finally { setEarningsLoading(false); }
  };

  const fetchFabricCounts = async (start: string, end: string) => {
    setFabricCountsLoading(true);
    try {
      const res = await fetch(`/api/fabric-counts?start=${start}&end=${end}`);
      if (res.ok) setFabricCounts(await res.json());
    } catch { setFabricCounts([]); } finally { setFabricCountsLoading(false); }
  };

  const handleFabricCountsFilter = (type: string, start?: string, end?: string) => {
    setFabricCountsDateRange(type);
    const today = new Date();
    if (type === "current") {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      setFabricCountsStart(monday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "last") {
      const dayOfWeek = today.getDay();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      setFabricCountsStart(lastMonday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(lastSunday.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "4week") {
      const fourWeeksAgo = new Date(today);
      fourWeeksAgo.setDate(today.getDate() - 27);
      setFabricCountsStart(fourWeeksAgo.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "custom" && start && end) {
      setFabricCountsStart(start);
      setFabricCountsEnd(end);
      setShowFabricCountsCustomPicker(false);
    } else if (type === "custom") {
      setShowFabricCountsCustomPicker(true);
    }
  };




  useEffect(() => {
    if (earningsStart && earningsEnd) fetchEarnings(earningsStart, earningsEnd);
  }, [earningsStart, earningsEnd]);

  useEffect(() => {
    if (fabricCountsStart && fabricCountsEnd) fetchFabricCounts(fabricCountsStart, fabricCountsEnd);
  }, [fabricCountsStart, fabricCountsEnd]);

  const handleEarningsFilter = (type: string, start?: string, end?: string) => {
    setEarningsDateRange(type);
    const now = new Date();
    if (type === "current") {
      // Current week (Monday to today)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      setEarningsStart(monday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "last") {
      // Last week (previous Monday to Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      setEarningsStart(lastMonday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(lastSunday.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "4week") {
      // Last 4 weeks (28 days ago to today)
      const today = new Date();
      const fourWeeksAgo = new Date(today);
      fourWeeksAgo.setDate(today.getDate() - 27);
      setEarningsStart(fourWeeksAgo.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "custom" && start && end) {
      setEarningsStart(start);
      setEarningsEnd(end);
      setShowEarningsCustomPicker(false);
    } else if (type === "custom") {
      setShowEarningsCustomPicker(true);
    }
  };
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  // If no user data, redirect to login
  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 font-medium">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex flex-wrap items-end justify-between gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
        >
          + Add Thread
        </button>
        <div className="flex flex-wrap gap-4">
          <Dropdown
            label="Filter by Thread Type"
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: "all", label: "All Types" },
              ...DEFAULT_THREAD_TYPES.map((type) => ({ value: type, label: type })),
            ]}
            minWidth="min-w-44"
          />
          <div className="relative">
            <Dropdown
              label="Filter by Date Range"
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setShowCustomDatePicker(value === "custom");
              }}
              options={DATE_RANGE_OPTIONS}
              minWidth="min-w-44"
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

      {/* Row 1: Cost Trend + Threads List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cost Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Cost Trend</h3>
          {isLoadingThreads ? (
            <TableSkeleton rows={5} cols={4} />
          ) : (
            <ThreadChart threads={getFilteredThreads()} />
          )}
        </div>

        {/* Threads List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Threads List</h3>
            {threadError && <p className="mt-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{threadError}</p>}
          </div>
          <div className="overflow-x-auto overflow-y-auto h-100">
            <table className="w-full">
              <thead className="bg-linear-to-r from-blue-50 to-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getFilteredThreads().length === 0 ? (
                  <tr><td colSpan={5}><NoDataFound title="No threads found" description="Try adjusting your filters or add a new thread." /></td></tr>
                ) : (
                  getFilteredThreads().map((thread, idx) => (
                    <tr key={thread.id} className={`transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}>
                      <td className="px-5 py-3 text-xs font-medium text-gray-900">{thread.type}</td>
                      <td className="px-5 py-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: COLOR_MAP[thread.color] || '#000000' }} />
                          <span className="text-gray-700">{thread.color}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-900">₹{thread.cost.toFixed(2)}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{new Date(thread.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-xs">
                        <button onClick={() => handleDeleteThread(thread.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Employee Earnings (half) + empty slot (half) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Employee Earnings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Employee Earnings</h3>
            <div className="relative">
              <Dropdown
                label=""
                value={earningsDateRange}
                onChange={(value) => {
                  setEarningsDateRange(value);
                  if (value === "custom") setShowEarningsCustomPicker(true);
                  else handleEarningsFilter(value);
                }}
                options={[
                  { value: "current", label: "Current Week" },
                  { value: "last", label: "Last Week" },
                  { value: "4week", label: "Last 4 Weeks" },
                  { value: "custom", label: "Custom" },
                ]}
                minWidth="min-w-40"
              />
              {earningsDateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={earningsCustomRange.startDate}
                  endDate={earningsCustomRange.endDate}
                  onStartDateChange={(date) => {
                    const updated = { ...earningsCustomRange, startDate: date };
                    setEarningsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleEarningsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  onEndDateChange={(date) => {
                    const updated = { ...earningsCustomRange, endDate: date };
                    setEarningsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleEarningsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  isOpen={showEarningsCustomPicker}
                  onClose={() => setShowEarningsCustomPicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
          {earningsLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <EmployeeEarningsBarChart data={earnings} />
          )}
        </div>

        {/* Fabric Count by Type */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fabric Count by Type</h3>
            <div className="relative">
              <Dropdown
                label=""
                value={fabricCountsDateRange}
                onChange={(value) => {
                  setFabricCountsDateRange(value);
                  if (value === "custom") setShowFabricCountsCustomPicker(true);
                  else handleFabricCountsFilter(value);
                }}
                options={[
                  { value: "current", label: "Current Week" },
                  { value: "last", label: "Last Week" },
                  { value: "4week", label: "Last 4 Weeks" },
                  { value: "custom", label: "Custom" },
                ]}
                minWidth="min-w-40"
              />
              {fabricCountsDateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={fabricCountsCustomRange.startDate}
                  endDate={fabricCountsCustomRange.endDate}
                  onStartDateChange={(date) => {
                    const updated = { ...fabricCountsCustomRange, startDate: date };
                    setFabricCountsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleFabricCountsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  onEndDateChange={(date) => {
                    const updated = { ...fabricCountsCustomRange, endDate: date };
                    setFabricCountsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleFabricCountsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  isOpen={showFabricCountsCustomPicker}
                  onClose={() => setShowFabricCountsCustomPicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
          {fabricCountsLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <FabricCountBarChart data={fabricCounts} />
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