"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import type { ContractRecord } from "@/types";

interface ContractFormProps {
  contract: ContractRecord;
  onSave: (data: ContractRecord) => void;
  onReparse: () => void;
}

interface FieldConfig {
  key: keyof ContractRecord;
  labelKey: "companyName" | "representative" | "address" | "businessNo" | "dataScope" | "recordCount" | "contractAmount" | "startDate" | "endDate" | "securityLevel" | "specialTerms";
  type?: "text" | "textarea" | "date";
}

const partyAFields: FieldConfig[] = [
  { key: "partyACompany", labelKey: "companyName" },
  { key: "partyARepresentative", labelKey: "representative" },
  { key: "partyAAddress", labelKey: "address" },
  { key: "partyABusinessNo", labelKey: "businessNo" },
];

const partyBFields: FieldConfig[] = [
  { key: "partyBCompany", labelKey: "companyName" },
  { key: "partyBRepresentative", labelKey: "representative" },
  { key: "partyBAddress", labelKey: "address" },
  { key: "partyBBusinessNo", labelKey: "businessNo" },
];

const dataFields: FieldConfig[] = [
  { key: "dataScope", labelKey: "dataScope", type: "textarea" },
  { key: "recordCount", labelKey: "recordCount" },
  { key: "contractAmount", labelKey: "contractAmount" },
  { key: "startDate", labelKey: "startDate" },
  { key: "endDate", labelKey: "endDate" },
  { key: "securityLevel", labelKey: "securityLevel" },
  { key: "specialTerms", labelKey: "specialTerms", type: "textarea" },
];

export default function ContractForm({
  contract,
  onSave,
  onReparse,
}: ContractFormProps) {
  const { t } = useTranslation();
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
      if (!res.ok) throw new Error(t.form.saveFailed);
      const updated = await res.json();
      onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : t.form.saveFailed);
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
      if (!res.ok) throw new Error(t.form.reparseFailed);
      const updated = await res.json();
      setFormData(updated);
      onReparse();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.form.reparseFailed);
    } finally {
      setReparsing(false);
    }
  };

  const renderField = ({ key, labelKey, type = "text" }: FieldConfig) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t.form[labelKey]}
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
          {t.form.contractName}
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
            {t.form.partyA}
          </span>
          {t.form.partyALabel}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {partyAFields.map(renderField)}
        </div>
      </div>

      {/* Party B */}
      <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-emerald-600 text-white rounded flex items-center justify-center text-xs font-bold">
            {t.form.partyB}
          </span>
          {t.form.partyBLabel}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {partyBFields.map(renderField)}
        </div>
      </div>

      {/* Data Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">{t.form.contractDetails}</h3>
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
              {t.form.saving}
            </span>
          ) : saveSuccess ? (
            t.form.saved
          ) : (
            t.form.save
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
              {t.form.reparsing}
            </span>
          ) : (
            t.form.reparse
          )}
        </button>
      </div>
    </div>
  );
}
