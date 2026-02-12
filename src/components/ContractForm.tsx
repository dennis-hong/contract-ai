"use client";

import { useState } from "react";
import type { ContractRecord } from "@/types";

interface ContractFormProps {
  contract: ContractRecord;
  onSave: (data: ContractRecord) => void;
  onReparse: () => void;
}

interface FieldConfig {
  key: keyof ContractRecord;
  label: string;
  type?: "text" | "textarea" | "date";
}

const partyAFields: FieldConfig[] = [
  { key: "partyACompany", label: "회사명" },
  { key: "partyARepresentative", label: "대표자" },
  { key: "partyAAddress", label: "주소" },
  { key: "partyABusinessNo", label: "사업자등록번호" },
];

const partyBFields: FieldConfig[] = [
  { key: "partyBCompany", label: "회사명" },
  { key: "partyBRepresentative", label: "대표자" },
  { key: "partyBAddress", label: "주소" },
  { key: "partyBBusinessNo", label: "사업자등록번호" },
];

const dataFields: FieldConfig[] = [
  { key: "dataScope", label: "데이터 범위", type: "textarea" },
  { key: "recordCount", label: "데이터 건수" },
  { key: "contractAmount", label: "계약 금액" },
  { key: "startDate", label: "계약 시작일" },
  { key: "endDate", label: "계약 종료일" },
  { key: "securityLevel", label: "보안 등급" },
  { key: "specialTerms", label: "특약사항", type: "textarea" },
];

export default function ContractForm({
  contract,
  onSave,
  onReparse,
}: ContractFormProps) {
  const [formData, setFormData] = useState<ContractRecord>(contract);
  const [saving, setSaving] = useState(false);
  const [reparsing, setReparsing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateField = (key: keyof ContractRecord, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "saved" }),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      const updated = await res.json();
      onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleReparse = async () => {
    setReparsing(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/parse`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("재파싱에 실패했습니다.");
      const updated = await res.json();
      setFormData(updated);
      onReparse();
    } catch (err) {
      alert(err instanceof Error ? err.message : "재파싱에 실패했습니다.");
    } finally {
      setReparsing(false);
    }
  };

  const renderField = ({ key, label, type = "text" }: FieldConfig) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={(formData[key] as string) ?? ""}
          onChange={(e) => updateField(key, e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          value={(formData[key] as string) ?? ""}
          onChange={(e) => updateField(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Contract Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          계약명
        </label>
        <input
          type="text"
          value={formData.contractName ?? ""}
          onChange={(e) => updateField("contractName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Party A */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
            갑
          </span>
          구매자 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {partyAFields.map(renderField)}
        </div>
      </div>

      {/* Party B */}
      <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-emerald-600 text-white rounded flex items-center justify-center text-xs font-bold">
            을
          </span>
          판매자 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {partyBFields.map(renderField)}
        </div>
      </div>

      {/* Data Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">계약 상세</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataFields.map(renderField)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </span>
          ) : saveSuccess ? (
            "저장 완료!"
          ) : (
            "저장"
          )}
        </button>
        <button
          onClick={handleReparse}
          disabled={reparsing}
          className="px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {reparsing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              재파싱 중...
            </span>
          ) : (
            "재파싱"
          )}
        </button>
      </div>
    </div>
  );
}
