"use client";

import { useTranslation } from "@/lib/i18n/context";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  parsing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  finalized: "bg-green-100 text-green-800 border-green-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const statusLabels: Record<string, string> = {
    parsing: t.status.parsing,
    draft: t.status.draft,
    in_review: t.status.inReview,
    finalized: t.status.finalized,
  };

  const label = statusLabels[status] ?? status;
  const className = statusStyles[status] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${className}`}
    >
      {status === "parsing" && (
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
      )}
      {status === "draft" && <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />}
      {status === "in_review" && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
      {status === "finalized" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
      {label}
    </span>
  );
}
