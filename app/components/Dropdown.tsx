"use client";

import { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minWidth?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  className = "",
  minWidth = "min-w-48",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder || "Select option";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className={`relative ${minWidth}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 text-sm font-medium transition-all flex items-center justify-between ${
            isOpen
              ? "border-indigo-400 ring-2 ring-indigo-200"
              : "border-gray-200 hover:border-indigo-300"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
        >
          <span>{displayLabel}</span>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className={`absolute top-full left-0 mt-2 ${minWidth} bg-white border-2 border-gray-300 rounded-lg shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150`}>
            <div className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2.5 text-left font-medium transition-colors ${
                    option.value === value
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.value === value && (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
