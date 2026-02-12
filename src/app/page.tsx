"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PDFUploader from "@/components/PDFUploader";
import PDFViewer from "@/components/PDFViewer";
import ContractForm from "@/components/ContractForm";
import StatusBadge from "@/components/StatusBadge";
import { useTranslation } from "@/lib/i18n/context";
import type { ContractRecord } from "@/types";

function UploadPageContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const { t } = useTranslation();

  const [contractId, setContractId] = useState<string | null>(idFromUrl);
  const [contract, setContract] = useState<ContractRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchContract = useCallback(async (id: string) => {
    const res = await fetch(`/api/contracts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setContract(data);
      return data;
    }
    return null;
  }, []);

  useEffect(() => {
    if (idFromUrl) {
      setContractId(idFromUrl);
      fetchContract(idFromUrl);
    }
  }, [idFromUrl, fetchContract]);

  useEffect(() => {
    if (!contractId || !polling) return;

    const interval = setInterval(async () => {
      const data = await fetchContract(contractId);
      if (data && data.status !== "parsing") {
        setPolling(false);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [contractId, polling, fetchContract]);

  const handleUploadComplete = async (id: string) => {
    setContractId(id);
    setPolling(true);
    await fetchContract(id);
  };

  const handleSave = (updated: ContractRecord) => {
    setContract(updated);
  };

  const handleReparse = () => {
    setPolling(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.home.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t.home.subtitle}
        </p>
      </div>

      {!contractId && (
        <div className="max-w-2xl mx-auto">
          <PDFUploader
            onUploadComplete={handleUploadComplete}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t.home.howToUse}
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                {t.home.step1}
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                {t.home.step2}
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                {t.home.step3}
              </li>
            </ol>
          </div>
        </div>
      )}

      {contractId && contract?.status === "parsing" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.home.analyzing}
            </h3>
            <p className="text-sm text-gray-500">
              {t.home.analyzingDesc}
            </p>
            <div className="mt-4">
              <StatusBadge status="parsing" />
            </div>
          </div>
        </div>
      )}

      {contractId && contract && contract.status !== "parsing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                {t.home.pdfPreview}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {contract.fileName}
                </span>
                <StatusBadge status={contract.status} />
              </div>
            </div>
            <PDFViewer contractId={contractId} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                {t.home.extractedInfo}
              </h2>
              <button
                onClick={() => {
                  setContractId(null);
                  setContract(null);
                  window.history.pushState({}, "", "/");
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {t.home.newUpload}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <ContractForm
                contract={contract}
                onSave={handleSave}
                onReparse={handleReparse}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
