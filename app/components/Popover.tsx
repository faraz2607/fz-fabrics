"use client";

import { ReactNode, useRef, useEffect } from "react";

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
  position = "right",
  className = "w-64",
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const positionClass = {
    right: "right-0",
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
  }[position];

  return (
    <div className="relative">
      <div ref={triggerRef}>{trigger}</div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute ${positionClass} mt-2 ${className} bg-white rounded-lg shadow-lg z-100 border border-gray-200 overflow-hidden`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
