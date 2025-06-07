import React, { type JSX } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "modal-sm" | "modal-md" | "modal-lg" | "modal-xl";
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "modal-md",
}: ModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  // This uses a div overlay instead of the daisyUI <dialog> element to give us more control,
  // similar to your example component's logic.
  return (
    <div className="modal modal-open">
      <div className={`modal-box ${size} relative`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-base-300">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4">{children}</div>
      </div>
      {/* Backdrop to close modal on outside click */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default Modal;
