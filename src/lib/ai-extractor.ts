import OpenAI from "openai";
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
import {
  defaultExtractedContractData,
  type ExtractedContractData,
} from "@/lib/contract-data";

const EXTRACTION_PROMPT = `You extract structured fields from medical data contracts.
Return ONLY one valid JSON object.

Required JSON shape:
{
  "vendorName": string | null,
  "acquisitionDate": "YYYY-MM-DD" | null,
  "additionalInformation": string | null,
  "allowedDataModifications": DataModificationType[],
  "allowedStorageCountries": string[],
  "allowedStorageMethod": StorageMethod,
  "allowedUsages": DataUsageType[],
  "autoRenewalDate": "YYYY-MM-DD" | null,
  "contractExpirationDate": "YYYY-MM-DD" | null,
  "contractLocation": string | null,
  "createdBy": string | null,
  "dataOriginCountries": string[],
  "displayName": string | null,    // short display label (e.g. "NorthBridge Radiology Dataset License v3")
  "licenseExpirationDate": "YYYY-MM-DD" | null,
  "licenseType": LicenseType,
  "mayAutoRenew": Trilean,
  "mayModifyData": Trilean,
  "mustDestroy": Trilean,
  "mustNotifyOnDeidFailure": boolean,
  "mustNotifyOnDeidFailureWithinDays": number | null,
  "name": string | null,          // internal contract name (e.g. "2026 NorthBridge Imaging Data License Agreement")
  "phiDeidMethod": PhiDeidMethod,
  "phiDeidHipaaMethod": PhiDeidHipaaMethod | null,
  "phiDeidOtherMethod": string | null,
  "status": ContractStatus,
  "version": number | null
}

Enums:
- ContractStatus: draft | in_review | finalized
- LicenseType: limited | perpetual | ownership
- Trilean: true | false | not_specified
- StorageMethod: cloud | on_premise | not_specified | others
- DataUsageType: academic_analysis | commercial_product_development | internal_research | validation_only
- DataModificationType: copy | modify_clinical_data | modify_dicom_tags | modify_format | modify_pixels | not_specified
- PhiDeidMethod: anonymization | pseudonymization | hipaa_deidentification | other
- PhiDeidHipaaMethod: safe_harbor | expert_determination

Rules:
- If unknown, use null for nullable fields.
- For enum fields with unknown values, use not_specified where possible.
- status should default to in_review unless clearly finalized.
- mustNotifyOnDeidFailure must be true only when explicit notice obligation exists.
- Arrays must contain unique values.
- Do not add extra keys.
- "name" is the full contract title; "displayName" is a shorter label. Both should be extracted if available.`;

const enumValues = <T extends Record<string, string>>(enumObj: T) =>
  Object.values(enumObj) as T[keyof T][];

function coerceEnum<T extends Record<string, string>>(
  value: unknown,
  enumObj: T,
  fallback: T[keyof T]
): T[keyof T] {
  if (typeof value !== "string") return fallback;
  return enumValues(enumObj).includes(value as T[keyof T])
    ? (value as T[keyof T])
    : fallback;
}

function coerceEnumArray<T extends Record<string, string>>(
  value: unknown,
  enumObj: T
): T[keyof T][] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(enumValues(enumObj));
  return value.filter(
    (entry): entry is T[keyof T] =>
      typeof entry === "string" && allowed.has(entry as T[keyof T])
  );
}

function uniqueStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? trimmed : null;
}

function normalizeExtracted(raw: unknown): ExtractedContractData {
  const defaults = defaultExtractedContractData();
  const parsed = (raw ?? {}) as Record<string, unknown>;

  return {
    vendorName: typeof parsed.vendorName === "string" ? parsed.vendorName.trim() : null,
    acquisitionDate: parseDate(parsed.acquisitionDate),
    additionalInformation:
      typeof parsed.additionalInformation === "string"
        ? parsed.additionalInformation.trim()
        : null,
    allowedDataModifications: (() => {
      const values = coerceEnumArray(parsed.allowedDataModifications, DataModificationType);
      return values.length > 0 ? values : defaults.allowedDataModifications;
    })(),
    allowedStorageCountries: uniqueStringArray(parsed.allowedStorageCountries),
    allowedStorageMethod: coerceEnum(
      parsed.allowedStorageMethod,
      StorageMethod,
      defaults.allowedStorageMethod
    ),
    allowedUsages: (() => {
      const values = coerceEnumArray(parsed.allowedUsages, DataUsageType);
      return values.length > 0 ? values : defaults.allowedUsages;
    })(),
    autoRenewalDate: parseDate(parsed.autoRenewalDate),
    contractExpirationDate: parseDate(parsed.contractExpirationDate),
    contractLocation:
      typeof parsed.contractLocation === "string"
        ? parsed.contractLocation.trim()
        : null,
    createdBy: typeof parsed.createdBy === "string" ? parsed.createdBy.trim() : null,
    dataOriginCountries: uniqueStringArray(parsed.dataOriginCountries),
    displayName:
      typeof parsed.displayName === "string" ? parsed.displayName.trim() : null,
    licenseExpirationDate: parseDate(parsed.licenseExpirationDate),
    licenseType: coerceEnum(parsed.licenseType, LicenseType, defaults.licenseType),
    mayAutoRenew: coerceEnum(parsed.mayAutoRenew, Trilean, defaults.mayAutoRenew),
    mayModifyData: coerceEnum(parsed.mayModifyData, Trilean, defaults.mayModifyData),
    mustDestroy: coerceEnum(parsed.mustDestroy, Trilean, defaults.mustDestroy),
    mustNotifyOnDeidFailure: Boolean(parsed.mustNotifyOnDeidFailure),
    mustNotifyOnDeidFailureWithinDays:
      typeof parsed.mustNotifyOnDeidFailureWithinDays === "number"
        ? parsed.mustNotifyOnDeidFailureWithinDays
        : null,
    name: typeof parsed.name === "string" ? parsed.name.trim() : null,
    phiDeidMethod: coerceEnum(
      parsed.phiDeidMethod,
      PhiDeidMethod,
      defaults.phiDeidMethod
    ),
    phiDeidHipaaMethod: (() => {
      const value = coerceEnum(
        parsed.phiDeidHipaaMethod,
        PhiDeidHipaaMethod,
        PhiDeidHipaaMethod.safe_harbor
      );
      return parsed.phiDeidHipaaMethod ? value : null;
    })(),
    phiDeidOtherMethod:
      typeof parsed.phiDeidOtherMethod === "string"
        ? parsed.phiDeidOtherMethod.trim()
        : null,
    status: coerceEnum(parsed.status, ContractStatus, ContractStatus.in_review),
    version: typeof parsed.version === "number" ? parsed.version : null,
  };
}

export async function extractContractData(
  rawText: string
): Promise<ExtractedContractData> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your-openai-api-key-here") {
    console.warn("OpenAI API key not configured, using fallback extraction");
    return fallbackExtraction(rawText);
  }

  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: rawText },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return normalizeExtracted(JSON.parse(content));
}

function fallbackExtraction(rawText: string): ExtractedContractData {
  const defaults = defaultExtractedContractData();
  const isKorean = /[가-힣]/.test(rawText);

  const displayName =
    rawText.match(isKorean ? /^(.*계약서.*)$/m : /^(.*(?:Agreement|Contract).*)$/im)?.[1]?.trim() ||
    null;

  const vendorName =
    rawText.match(
      isKorean
        ? /"을".*?\n\s*(?:회사명|기관명)[:\s]*(.+)/m
        : /(?:Party\s*B|Seller|Provider).*?(?:Company|Name)[:\s]*(.+)/im
    )?.[1]?.trim() || null;

  return {
    ...defaults,
    vendorName,
    displayName,
    name: displayName,
    status: ContractStatus.in_review,
  };
}
