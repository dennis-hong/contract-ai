interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  parsing: {
    label: "파싱 중",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  review: {
    label: "검토 대기",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  saved: {
    label: "저장 완료",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.className}`}
    >
      {status === "parsing" && (
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
      )}
      {status === "review" && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      )}
      {status === "saved" && (
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
      )}
      {config.label}
    </span>
  );
}
