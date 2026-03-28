"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import Dropdown from "@/app/components/Dropdown";
import { Thread } from "../page";
import {
  DEFAULT_THREAD_TYPES,
  AVAILABLE_COLORS,
  COLOR_MAP,
} from "../constants";

interface AddThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddThread: (thread: Omit<Thread, "id">) => void;
  threadTypes: string[];
}

export default function AddThreadModal({
  isOpen,
  onClose,
  onAddThread,
  threadTypes,
}: AddThreadModalProps) {
  const [threadType, setThreadType] = useState(DEFAULT_THREAD_TYPES[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>("");

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!cost || isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      setError("Please enter a valid cost amount");
      return;
    }

    onAddThread({
      type: threadType,
      color: color,
      cost: parseFloat(cost),
      date: new Date(date).toISOString(),
    });

    // Reset form
    setThreadType(DEFAULT_THREAD_TYPES[0]);
    setColor(AVAILABLE_COLORS[0]);
    setCost("");
    setDate(new Date().toISOString().split('T')[0]);
    setError("");
  };

  const threadTypeOptions = DEFAULT_THREAD_TYPES.map((type) => ({
    value: type,
    label: type,
  }));

  const colorOptions = AVAILABLE_COLORS.map((colorName) => ({
    value: colorName,
    label: colorName,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Thread">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thread Type Selection */}
        <Dropdown
          value={threadType}
          onChange={(value) => {
            setThreadType(value);
            setError("");
          }}
          options={threadTypeOptions}
          label="Thread Type"
        />

        {/* Color Selection */}
        <Dropdown
          value={color}
          onChange={(value) => {
            setColor(value);
            setError("");
          }}
          options={colorOptions}
          label="Thread Color"
        />

        {/* Color Preview */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: COLOR_MAP[color] || "#000" }}
          ></div>
          <span className="text-sm text-gray-700">Color Preview</span>
        </div>

        {/* Cost Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => {
              setCost(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter cost amount"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-pointer"
              onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            Add Thread
          </button>
        </div>
      </form>
    </Modal>
  );
}

