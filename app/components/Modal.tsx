"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="px-7 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
