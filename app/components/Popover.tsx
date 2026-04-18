"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  position?: "right" | "left" | "center";
  className?: string;
}

export default function Popover({
  isOpen,
  onClose,
  trigger,
  children,
  className = "w-64",
}: PopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Position the popover relative to the trigger, keeping it inside the viewport
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320; // w-80
    const gap = 8;

    let left = triggerRect.right - popoverWidth;
    if (left < gap) left = gap;
    if (left + popoverWidth > window.innerWidth - gap) {
      left = window.innerWidth - popoverWidth - gap;
    }

    setCoords({
      top: triggerRect.bottom + gap,
      left,
    });
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
          className={`${className} bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden`}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}