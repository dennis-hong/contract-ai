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

const EXTRACTION_PROMPT = `You are a medical data contract analyst. Extract structured fields from medical data contracts, SOWs (Statements of Work), license agreements, and data purchase agreements.

Return ONLY one valid JSON object matching this schema:

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
  "displayName": string | null,
  "licenseExpirationDate": "YYYY-MM-DD" | null,
  "licenseType": LicenseType,
  "mayAutoRenew": Trilean,
  "mayModifyData": Trilean,
  "mustDestroy": Trilean,
  "mustNotifyOnDeidFailure": boolean,
  "mustNotifyOnDeidFailureWithinDays": number | null,
  "name": string | null,
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

FIELD EXTRACTION GUIDE:
- "vendorName": Look for "Vendor Name", "Prepared By", "Party B", "Seller", "Provider", "을" (Korean)
- "name": Full document title or contract name (e.g. "Large Imaging Dataset Project - Alpha SOW"). Use document header, SOW title, or project name.
- "displayName": Short label (e.g. "SOW-100001 V1.0 Alpha"). Use SOW number + version + short project name.
- "acquisitionDate": "Effective Date", "Contract Date", "Execution Date", "계약일"
- "contractExpirationDate": "End Date", "Expiration Date", "Term", "계약 만료일"
- "contractLocation": Vendor or Client address/city/state, or jurisdiction clause
- "createdBy": Vendor contact person name, or document preparer
- "version": Version number from document header (e.g. "V 1.3" → 1, "V 2.1" → 2)
- "dataOriginCountries": Geographic requirements section - look for country names, "United States", "US", "Korea", etc. Use 2-letter ISO codes.
- "allowedStorageCountries": Where data may be stored - if delivery path mentions locations, use those. Otherwise infer from client address country.
- "allowedStorageMethod": Look for delivery method - "secure_transfer", "S3", "cloud" → cloud; "physical media" → on_premise
- "allowedUsages": Infer from project purpose - imaging AI → internal_research; academic publication → academic_analysis; product development → commercial_product_development; validation/testing → validation_only
- "allowedDataModifications": Look for anonymization section - if DICOM headers modified → modify_dicom_tags; if pixel data masked → modify_pixels; if format conversion mentioned → modify_format; if copying allowed → copy; if clinical data modified → modify_clinical_data
- "licenseType": "perpetual" if permanent; "limited" if time-bound or SOW-based; "ownership" if data ownership transfers
- "mayModifyData": If anonymization/de-identification is performed → "true"
- "mustDestroy": If data destruction after use is mentioned → "true"; otherwise "not_specified"
- "phiDeidMethod": If HIPAA mentioned → "hipaa_deidentification"; if "anonymization" or "de-identification" → "anonymization"; if "pseudonymization" → "pseudonymization"
- "phiDeidHipaaMethod": If Safe Harbor method mentioned → "safe_harbor"; if Expert Determination → "expert_determination"
- "phiDeidOtherMethod": Any additional de-id details (e.g. "pixel masking", "burned-in text removal", "K-anonymity >= 15")
- "mustNotifyOnDeidFailure": true if breach/failure notification obligation exists
- "additionalInformation": Summarize key details not captured elsewhere: cohort sizes, inclusion/exclusion criteria, deliverables, special terms, dataset specifications

RULES:
- Extract as much as possible. Prefer partial data over null.
- For SOW/Statement of Work documents: the vendor is the data provider (Prepared By), the client is the buyer (Prepared For).
- If unknown, use null for nullable fields.
- For enum fields with unknown values, use not_specified where possible.
- status should default to "in_review" unless clearly finalized or signed.
- Arrays must contain unique values.
- Do not add extra keys.
- Support both English and Korean (한국어) documents.`;

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
    model: "gpt-5.2",
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: rawText.slice(0, 30000) },
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

  // Try to extract document title
  const displayName =
    rawText.match(/^(.*(?:Statement of Work|Agreement|Contract|SOW|계약서).*)$/im)?.[1]?.trim() ||
    rawText.match(/^(.*(?:Project Name|프로젝트명)\s*[:：]\s*(.+))$/im)?.[2]?.trim() ||
    null;

  // Try to extract vendor name
  const vendorName =
    rawText.match(/Vendor\s*Name\s*[:：]\s*(.+)/im)?.[1]?.trim() ||
    rawText.match(/Prepared\s*By[\s\S]*?(?:Company|Name|Vendor)\s*[:：]\s*(.+)/im)?.[1]?.trim() ||
    rawText.match(/"을".*?\n\s*(?:회사명|기관명)\s*[:：]\s*(.+)/m)?.[1]?.trim() ||
    null;

  // Try to extract SOW number for displayName
  const sowNumber = rawText.match(/SOW\s*(?:Number|#)?\s*[:：]?\s*(SOW-?\d+)/im)?.[1]?.trim();
  const version = rawText.match(/Version\s*[:：]\s*(\d+)/im)?.[1];
  const shortDisplay = sowNumber ? `${sowNumber}${version ? ` V${version}` : ""}` : null;

  // Try effective date
  const effectiveDate =
    rawText.match(/Effective\s*Date\s*[:：]\s*(\d{4}-\d{2}-\d{2})/im)?.[1] || null;

  // Try to extract created by (vendor contact)
  const createdBy =
    rawText.match(/Vendor\s*Contact\s*[:：]\s*([^/\n]+)/im)?.[1]?.trim() || null;

  return {
    ...defaults,
    vendorName,
    displayName: shortDisplay || displayName,
    name: displayName,
    acquisitionDate: effectiveDate,
    createdBy,
    status: ContractStatus.in_review,
    version: version ? parseInt(version, 10) : null,
  };
}
