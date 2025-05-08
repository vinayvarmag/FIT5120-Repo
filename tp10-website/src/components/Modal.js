"use client";
import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 relative w-full max-w-2xl border-2 border-black">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                {/* Modal title */}
                <h3 className="text-lg font-bold mb-4 text-black">{title}</h3>

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
