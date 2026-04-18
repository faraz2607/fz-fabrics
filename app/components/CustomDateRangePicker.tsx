import React, { ReactNode } from "react";
import Popover from "./Popover";

interface CustomDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
}

export default function CustomDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isOpen,
  onClose,
  trigger,
}: CustomDateRangePickerProps) {
  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      trigger={trigger}
      position="right"
      className="w-72"
    >
      <div className="p-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Custom Date Range</h4>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
        </div>
        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <p className="text-red-500 text-xs mt-1.5">Start date must be before end date</p>
        )}
      </div>
    </Popover>
  );
}
