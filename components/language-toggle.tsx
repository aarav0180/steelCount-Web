"use client"

import { useState } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectLanguage = (lang: "en" | "ja") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-gray-300 hover:bg-gray-100 bg-white text-black flex items-center gap-2"
        onClick={toggleDropdown}
      >
        <Globe className="h-4 w-4" />
        {language === "en" ? "EN" : "日本語"}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] bg-white border border-gray-200 rounded-md shadow-lg">
            <button
              onClick={() => selectLanguage("en")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                language === "en" ? "bg-gray-50 font-medium" : ""
              }`}
            >
              English
            </button>
            <button
              onClick={() => selectLanguage("ja")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                language === "ja" ? "bg-gray-50 font-medium" : ""
              }`}
            >
              日本語
            </button>
          </div>
        </>
      )}
    </div>
  )
}
