import React from "react";
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  threadDetails?: {
    type: string;
    color: string;
    date: string;
  };
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  threadDetails,
}: ConfirmationModalProps) {
  const getButtonStyles = () => {
    switch (type) {
      case "danger":
        return {
          confirm: "bg-red-600 hover:bg-red-700",
          cancel: "border-red-600 text-red-600 hover:bg-red-50",
        };
      case "warning":
        return {
          confirm: "bg-yellow-600 hover:bg-yellow-700",
          cancel: "border-yellow-600 text-yellow-600 hover:bg-yellow-50",
        };
      default:
        return {
          confirm: "bg-blue-600 hover:bg-blue-700",
          cancel: "border-blue-600 text-blue-600 hover:bg-blue-50",
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-700 text-sm">{message}</p>
        
        {threadDetails && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Thread Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-bold text-gray-900">{threadDetails.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <div className="ml-2 inline-flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: threadDetails.color }}
                  ></div>
                  <span className="font-bold text-gray-900">{threadDetails.color}</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-bold text-gray-900">
                  {new Date(threadDetails.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium ${buttonStyles.cancel}`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${buttonStyles.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
