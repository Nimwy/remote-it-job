"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

// Class dùng chung cho ô input (A-03) — một nguồn duy nhất, tránh lặp 4 chỗ.
export const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);
