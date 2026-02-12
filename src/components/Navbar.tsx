"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

export default function Navbar() {
  const { t, toggleLanguage } = useTranslation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Contract AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t.nav.upload}
            </Link>
            <Link
              href="/contracts"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t.nav.contracts}
            </Link>
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {t.lang.toggle}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
