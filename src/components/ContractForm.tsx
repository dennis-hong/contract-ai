"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ContractStatus,
  DataModificationType,
  DataUsageType,
  LicenseType,
  PhiDeidHipaaMethod,
  PhiDeidMethod,
  StorageMethod,
  Trilean,
} from "@/generated/prisma/enums";
import { useTranslation } from "@/lib/i18n/context";
import type { ContractDataInput, ContractRecord } from "@/types";

interface ContractFormProps {
  contract: ContractRecord;
  onSave: (data: ContractRecord) => void;
  onReparse: () => void;
}

const COUNTRY_OPTIONS = [
  "US",
  "KR",
  "JP",
  "CA",
  "UK",
  "DE",
  "FR",
  "SG",
  "AU",
];

const enumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function MultiSelect({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: readonly string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <select
      multiple
      value={value}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
        onChange(selected);
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {enumLabel(option)}
        </option>
      ))}
    </select>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option ? enumLabel(option) : "Not specified"}
        </option>
      ))}
    </select>
  );
}

const textInputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

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

  useEffect(() => {
    setFormData(contract);
  }, [contract]);

  const updateData = <K extends keyof ContractDataInput>(key: K, value: ContractDataInput[K]) => {
    setFormData((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
    setSaveSuccess(false);
  };

  const updateTopLevel = (key: "vendorName", value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const usageOptions = useMemo(() => Object.values(DataUsageType), []);
  const modificationOptions = useMemo(() => Object.values(DataModificationType), []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(t.form.saveFailed);
      const updated = (await res.json()) as ContractRecord;
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
      const updated = (await res.json()) as ContractRecord;
      setFormData(updated);
      onSave(updated);
      onReparse();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.form.reparseFailed);
    } finally {
      setReparsing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
          <input
            type="text"
            value={formData.vendorName}
            onChange={(e) => updateTopLevel("vendorName", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={formData.data.displayName}
            onChange={(e) => updateData("displayName", e.target.value)}
            className={textInputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name</label>
          <input
            type="text"
            value={formData.data.name}
            onChange={(e) => updateData("name", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <input
            type="text"
            value={formData.data.createdBy}
            onChange={(e) => updateData("createdBy", e.target.value)}
            className={textInputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date</label>
          <input
            type="date"
            value={formData.data.acquisitionDate}
            onChange={(e) => updateData("acquisitionDate", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auto Renewal Date</label>
          <input
            type="date"
            value={formData.data.autoRenewalDate}
            onChange={(e) => updateData("autoRenewalDate", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract Expiration</label>
          <input
            type="date"
            value={formData.data.contractExpirationDate}
            onChange={(e) => updateData("contractExpirationDate", e.target.value)}
            className={textInputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Expiration</label>
          <input
            type="date"
            value={formData.data.licenseExpirationDate}
            onChange={(e) => updateData("licenseExpirationDate", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract Location</label>
          <input
            type="text"
            value={formData.data.contractLocation}
            onChange={(e) => updateData("contractLocation", e.target.value)}
            className={textInputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Data Modifications</label>
          <MultiSelect
            value={formData.data.allowedDataModifications}
            options={modificationOptions}
            onChange={(next) => updateData("allowedDataModifications", next as ContractDataInput["allowedDataModifications"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Usages</label>
          <MultiSelect
            value={formData.data.allowedUsages}
            options={usageOptions}
            onChange={(next) => updateData("allowedUsages", next as ContractDataInput["allowedUsages"])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Storage Countries</label>
          <MultiSelect
            value={formData.data.allowedStorageCountries}
            options={COUNTRY_OPTIONS}
            onChange={(next) => updateData("allowedStorageCountries", next)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Origin Countries</label>
          <MultiSelect
            value={formData.data.dataOriginCountries}
            options={COUNTRY_OPTIONS}
            onChange={(next) => updateData("dataOriginCountries", next)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Method</label>
          <Select
            value={formData.data.allowedStorageMethod}
            options={Object.values(StorageMethod)}
            onChange={(next) => updateData("allowedStorageMethod", next as ContractDataInput["allowedStorageMethod"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
          <Select
            value={formData.data.licenseType}
            options={Object.values(LicenseType)}
            onChange={(next) => updateData("licenseType", next as ContractDataInput["licenseType"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select
            value={formData.data.status}
            options={Object.values(ContractStatus)}
            onChange={(next) => updateData("status", next as ContractDataInput["status"])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">May Auto Renew</label>
          <Select
            value={formData.data.mayAutoRenew}
            options={Object.values(Trilean)}
            onChange={(next) => updateData("mayAutoRenew", next as ContractDataInput["mayAutoRenew"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">May Modify Data</label>
          <Select
            value={formData.data.mayModifyData}
            options={Object.values(Trilean)}
            onChange={(next) => updateData("mayModifyData", next as ContractDataInput["mayModifyData"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Must Destroy</label>
          <Select
            value={formData.data.mustDestroy}
            options={Object.values(Trilean)}
            onChange={(next) => updateData("mustDestroy", next as ContractDataInput["mustDestroy"])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PHI De-ID Method</label>
          <Select
            value={formData.data.phiDeidMethod}
            options={Object.values(PhiDeidMethod)}
            onChange={(next) => updateData("phiDeidMethod", next as ContractDataInput["phiDeidMethod"])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HIPAA Method</label>
          <Select
            value={formData.data.phiDeidHipaaMethod}
            options={["", ...Object.values(PhiDeidHipaaMethod)]}
            onChange={(next) => updateData("phiDeidHipaaMethod", next as ContractDataInput["phiDeidHipaaMethod"])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 pt-7">
          <input
            id="mustNotifyOnDeidFailure"
            type="checkbox"
            checked={formData.data.mustNotifyOnDeidFailure}
            onChange={(e) => updateData("mustNotifyOnDeidFailure", e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="mustNotifyOnDeidFailure" className="text-sm text-gray-700">
            Must Notify on De-ID Failure
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notify Within Days</label>
          <input
            type="number"
            min={0}
            value={formData.data.mustNotifyOnDeidFailureWithinDays}
            onChange={(e) => updateData("mustNotifyOnDeidFailureWithinDays", e.target.value)}
            className={textInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
          <input
            type="number"
            min={0}
            value={formData.data.version}
            onChange={(e) => updateData("version", e.target.value)}
            className={textInputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
        <textarea
          value={formData.data.additionalInformation}
          onChange={(e) => updateData("additionalInformation", e.target.value)}
          rows={3}
          className={`${textInputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Other PHI De-ID Method</label>
        <textarea
          value={formData.data.phiDeidOtherMethod}
          onChange={(e) => updateData("phiDeidOtherMethod", e.target.value)}
          rows={2}
          className={`${textInputClass} resize-none`}
        />
      </div>

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
