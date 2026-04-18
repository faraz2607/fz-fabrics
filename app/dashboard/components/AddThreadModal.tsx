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
      <form onSubmit={handleSubmit} className="space-y-3">
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
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
          <div
            className="w-5 h-5 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: COLOR_MAP[color] || "#000" }}
          ></div>
          <span className="text-xs text-gray-700">Color Preview</span>
        </div>

        {/* Cost Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Cost (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={cost}
            onChange={(e) => {
              setCost(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter cost amount"
            className={`w-full px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${
              error ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError(""); }}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition cursor-pointer"
            onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
          >
            Add Thread
          </button>
        </div>
      </form>
    </Modal>
  );
}

