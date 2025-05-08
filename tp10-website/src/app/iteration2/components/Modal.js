"use client";
import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 relative w-full max-w-2xl border-2 border-black">
                <h3 className="text-lg font-bold mb-4 text-black">{title}</h3>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 hover:text-black text-black border-2 border-black"
                >
                    <i className="ri-close-line ri-lg" />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;