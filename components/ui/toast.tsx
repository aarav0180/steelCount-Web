"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all",
        "bg-white border-slate-200",
        {
          "border-green-200 bg-green-50": variant === "success",
          "border-red-200 bg-red-50": variant === "error",
        },
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <div
              className={cn("font-semibold text-sm", {
                "text-green-800": variant === "success",
                "text-red-800": variant === "error",
                "text-slate-800": variant === "default",
              })}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className={cn("text-sm mt-1", {
                "text-green-700": variant === "success",
                "text-red-700": variant === "error",
                "text-slate-600": variant === "default",
              })}
            >
              {description}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={cn("rounded-sm opacity-70 hover:opacity-100 transition-opacity", {
            "text-green-800 hover:text-green-900": variant === "success",
            "text-red-800 hover:text-red-900": variant === "error",
            "text-slate-800 hover:text-slate-900": variant === "default",
          })}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
