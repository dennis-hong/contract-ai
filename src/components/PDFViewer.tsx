"use client";

interface PDFViewerProps {
  contractId: string;
}

export default function PDFViewer({ contractId }: PDFViewerProps) {
  return (
    <div className="w-full h-full min-h-[600px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      <iframe
        src={`/api/contracts/${contractId}/file`}
        className="w-full h-full min-h-[600px]"
        title="PDF Preview"
      />
    </div>
  );
}
