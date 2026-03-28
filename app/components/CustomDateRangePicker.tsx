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
      className="w-80"
    >
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Custom Date Range</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>
        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <p className="text-red-500 text-xs mt-2">Start date must be before end date</p>
        )}
      </div>
    </Popover>
  );
}
