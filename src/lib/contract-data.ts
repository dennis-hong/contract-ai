import type {
  Contract,
  ContractData,
  Prisma,
  Vendor,
} from "@/generated/prisma/client";
import {
  ContractStatus,
  DataModificationType,
  DataUsageType,
  LicenseType,
  PhiDeidMethod,
  PhiDeidHipaaMethod,
  StorageMethod,
  Trilean,
  type ContractStatus as ContractStatusType,
  type DataModificationType as DataModificationTypeType,
  type DataUsageType as DataUsageTypeType,
  type LicenseType as LicenseTypeType,
  type PhiDeidHipaaMethod as PhiDeidHipaaMethodType,
  type PhiDeidMethod as PhiDeidMethodType,
  type StorageMethod as StorageMethodType,
  type Trilean as TrileanType,
} from "@/generated/prisma/enums";
import type { ContractDataInput, ContractListItem, ContractRecord } from "@/types";

export interface ExtractedContractData {
  vendorName: string | null;
  acquisitionDate: string | null;
  additionalInformation: string | null;
  allowedDataModifications: DataModificationTypeType[];
  allowedStorageCountries: string[];
  allowedStorageMethod: StorageMethodType;
  allowedUsages: DataUsageTypeType[];
  autoRenewalDate: string | null;
  contractExpirationDate: string | null;
  contractLocation: string | null;
  createdBy: string | null;
  dataOriginCountries: string[];
  displayName: string | null;
  licenseExpirationDate: string | null;
  licenseType: LicenseTypeType;
  mayAutoRenew: TrileanType;
  mayModifyData: TrileanType;
  mustDestroy: TrileanType;
  mustNotifyOnDeidFailure: boolean;
  mustNotifyOnDeidFailureWithinDays: number | null;
  name: string | null;
  phiDeidMethod: PhiDeidMethodType;
  phiDeidHipaaMethod: PhiDeidHipaaMethodType | null;
  phiDeidOtherMethod: string | null;
  status: ContractStatusType;
  version: number | null;
}

const dateToInput = (value: Date | null | undefined): string => {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
};

const inputToDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const splitList = (value: string): string[] => {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseIntOrNull = (value: string): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const ensureList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
};

const enumValues = <T extends Record<string, string>>(enumObj: T) =>
  Object.values(enumObj) as T[keyof T][];

const coerceEnum = <T extends Record<string, string>>(
  value: unknown,
  enumObj: T,
  fallback: T[keyof T]
): T[keyof T] => {
  if (typeof value !== "string") return fallback;
  return enumValues(enumObj).includes(value as T[keyof T])
    ? (value as T[keyof T])
    : fallback;
};

const coerceEnumArray = <T extends Record<string, string>>(
  value: unknown,
  enumObj: T
): T[keyof T][] => {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(enumValues(enumObj));
  return value.filter(
    (entry): entry is T[keyof T] =>
      typeof entry === "string" && allowed.has(entry as T[keyof T])
  );
};

export const defaultContractDataInput = (): ContractDataInput => ({
  acquisitionDate: "",
  additionalInformation: "",
  allowedDataModifications: [DataModificationType.not_specified],
  allowedStorageCountries: [],
  allowedStorageMethod: StorageMethod.not_specified,
  allowedUsages: [DataUsageType.internal_research],
  autoRenewalDate: "",
  contractExpirationDate: "",
  contractLocation: "",
  createdBy: "",
  dataOriginCountries: [],
  displayName: "",
  licenseExpirationDate: "",
  licenseType: LicenseType.limited,
  mayAutoRenew: Trilean.not_specified,
  mayModifyData: Trilean.not_specified,
  mustDestroy: Trilean.not_specified,
  mustNotifyOnDeidFailure: false,
  mustNotifyOnDeidFailureWithinDays: "",
  name: "",
  phiDeidMethod: PhiDeidMethod.anonymization,
  phiDeidHipaaMethod: "",
  phiDeidOtherMethod: "",
  status: ContractStatus.draft,
  version: "",
});

export const defaultExtractedContractData = (): ExtractedContractData => ({
  vendorName: null,
  acquisitionDate: null,
  additionalInformation: null,
  allowedDataModifications: [DataModificationType.not_specified],
  allowedStorageCountries: [],
  allowedStorageMethod: StorageMethod.not_specified,
  allowedUsages: [DataUsageType.internal_research],
  autoRenewalDate: null,
  contractExpirationDate: null,
  contractLocation: null,
  createdBy: null,
  dataOriginCountries: [],
  displayName: null,
  licenseExpirationDate: null,
  licenseType: LicenseType.limited,
  mayAutoRenew: Trilean.not_specified,
  mayModifyData: Trilean.not_specified,
  mustDestroy: Trilean.not_specified,
  mustNotifyOnDeidFailure: false,
  mustNotifyOnDeidFailureWithinDays: null,
  name: null,
  phiDeidMethod: PhiDeidMethod.anonymization,
  phiDeidHipaaMethod: null,
  phiDeidOtherMethod: null,
  status: ContractStatus.in_review,
  version: null,
});

export const extractedToInput = (
  extracted: ExtractedContractData
): ContractDataInput => ({
  acquisitionDate: extracted.acquisitionDate ?? "",
  additionalInformation: extracted.additionalInformation ?? "",
  allowedDataModifications:
    extracted.allowedDataModifications.length > 0
      ? extracted.allowedDataModifications
      : [DataModificationType.not_specified],
  allowedStorageCountries: extracted.allowedStorageCountries,
  allowedStorageMethod: extracted.allowedStorageMethod,
  allowedUsages:
    extracted.allowedUsages.length > 0
      ? extracted.allowedUsages
      : [DataUsageType.internal_research],
  autoRenewalDate: extracted.autoRenewalDate ?? "",
  contractExpirationDate: extracted.contractExpirationDate ?? "",
  contractLocation: extracted.contractLocation ?? "",
  createdBy: extracted.createdBy ?? "",
  dataOriginCountries: extracted.dataOriginCountries,
  displayName: extracted.displayName ?? "",
  licenseExpirationDate: extracted.licenseExpirationDate ?? "",
  licenseType: extracted.licenseType,
  mayAutoRenew: extracted.mayAutoRenew,
  mayModifyData: extracted.mayModifyData,
  mustDestroy: extracted.mustDestroy,
  mustNotifyOnDeidFailure: extracted.mustNotifyOnDeidFailure,
  mustNotifyOnDeidFailureWithinDays:
    extracted.mustNotifyOnDeidFailureWithinDays?.toString() ?? "",
  name: extracted.name ?? "",
  phiDeidMethod: extracted.phiDeidMethod,
  phiDeidHipaaMethod: extracted.phiDeidHipaaMethod ?? "",
  phiDeidOtherMethod: extracted.phiDeidOtherMethod ?? "",
  status: extracted.status,
  version: extracted.version?.toString() ?? "",
});

export const parseContractDataInput = (value: unknown): ContractDataInput => {
  const input = (value ?? {}) as Record<string, unknown>;

  const allowedDataModifications = coerceEnumArray(
    input.allowedDataModifications,
    DataModificationType
  );
  const allowedUsages = coerceEnumArray(input.allowedUsages, DataUsageType);
  const phiDeidHipaaMethod = coerceEnum(
    input.phiDeidHipaaMethod,
    PhiDeidHipaaMethod,
    PhiDeidHipaaMethod.safe_harbor
  );

  return {
    acquisitionDate: typeof input.acquisitionDate === "string" ? input.acquisitionDate : "",
    additionalInformation:
      typeof input.additionalInformation === "string" ? input.additionalInformation : "",
    allowedDataModifications:
      allowedDataModifications.length > 0
        ? allowedDataModifications
        : [DataModificationType.not_specified],
    allowedStorageCountries: ensureList(input.allowedStorageCountries),
    allowedStorageMethod: coerceEnum(
      input.allowedStorageMethod,
      StorageMethod,
      StorageMethod.not_specified
    ),
    allowedUsages,
    autoRenewalDate: typeof input.autoRenewalDate === "string" ? input.autoRenewalDate : "",
    contractExpirationDate:
      typeof input.contractExpirationDate === "string"
        ? input.contractExpirationDate
        : "",
    contractLocation: typeof input.contractLocation === "string" ? input.contractLocation : "",
    createdBy: typeof input.createdBy === "string" ? input.createdBy : "",
    dataOriginCountries: ensureList(input.dataOriginCountries),
    displayName: typeof input.displayName === "string" ? input.displayName : "",
    licenseExpirationDate:
      typeof input.licenseExpirationDate === "string" ? input.licenseExpirationDate : "",
    licenseType: coerceEnum(input.licenseType, LicenseType, LicenseType.limited),
    mayAutoRenew: coerceEnum(input.mayAutoRenew, Trilean, Trilean.not_specified),
    mayModifyData: coerceEnum(input.mayModifyData, Trilean, Trilean.not_specified),
    mustDestroy: coerceEnum(input.mustDestroy, Trilean, Trilean.not_specified),
    mustNotifyOnDeidFailure: Boolean(input.mustNotifyOnDeidFailure),
    mustNotifyOnDeidFailureWithinDays:
      typeof input.mustNotifyOnDeidFailureWithinDays === "string"
        ? input.mustNotifyOnDeidFailureWithinDays
        : "",
    name: typeof input.name === "string" ? input.name : "",
    phiDeidMethod: coerceEnum(input.phiDeidMethod, PhiDeidMethod, PhiDeidMethod.anonymization),
    phiDeidHipaaMethod:
      typeof input.phiDeidHipaaMethod === "string" && input.phiDeidHipaaMethod.trim()
        ? phiDeidHipaaMethod
        : "",
    phiDeidOtherMethod:
      typeof input.phiDeidOtherMethod === "string" ? input.phiDeidOtherMethod : "",
    status: coerceEnum(input.status, ContractStatus, ContractStatus.draft),
    version: typeof input.version === "string" ? input.version : "",
  };
};

export const toContractDataWriteInput = (
  input: ContractDataInput
): Prisma.ContractDataCreateWithoutContractInput => ({
  acquisitionDate: inputToDate(input.acquisitionDate) ?? new Date(),
  additionalInformation: input.additionalInformation || null,
  allowedDataModifications:
    input.allowedDataModifications.length > 0
      ? input.allowedDataModifications
      : [DataModificationType.not_specified],
  allowedStorageCountries: input.allowedStorageCountries,
  allowedStorageMethod: input.allowedStorageMethod,
  allowedUsages:
    input.allowedUsages.length > 0
      ? input.allowedUsages
      : [DataUsageType.internal_research],
  autoRenewalDate: inputToDate(input.autoRenewalDate),
  contractExpirationDate: inputToDate(input.contractExpirationDate),
  contractLocation: input.contractLocation || "",
  createdBy: input.createdBy || null,
  dataOriginCountries: input.dataOriginCountries,
  displayName: input.displayName || "",
  licenseExpirationDate: inputToDate(input.licenseExpirationDate),
  licenseType: input.licenseType,
  mayAutoRenew: input.mayAutoRenew,
  mayModifyData: input.mayModifyData,
  mustDestroy: input.mustDestroy,
  mustNotifyOnDeidFailure: input.mustNotifyOnDeidFailure,
  mustNotifyOnDeidFailureWithinDays: parseIntOrNull(
    input.mustNotifyOnDeidFailureWithinDays
  ),
  name: input.name || "",
  phiDeidMethod: input.phiDeidMethod,
  phiDeidHipaaMethod: input.phiDeidHipaaMethod || null,
  phiDeidOtherMethod: input.phiDeidOtherMethod || null,
  status: input.status,
  version: parseIntOrNull(input.version),
});

export const toContractDataUpdateInput = (
  input: ContractDataInput
): Prisma.ContractDataUpdateWithoutContractInput => ({
  acquisitionDate: inputToDate(input.acquisitionDate) ?? new Date(),
  additionalInformation: input.additionalInformation || null,
  allowedDataModifications:
    input.allowedDataModifications.length > 0
      ? input.allowedDataModifications
      : [DataModificationType.not_specified],
  allowedStorageCountries: input.allowedStorageCountries,
  allowedStorageMethod: input.allowedStorageMethod,
  allowedUsages:
    input.allowedUsages.length > 0
      ? input.allowedUsages
      : [DataUsageType.internal_research],
  autoRenewalDate: inputToDate(input.autoRenewalDate),
  contractExpirationDate: inputToDate(input.contractExpirationDate),
  contractLocation: input.contractLocation || "",
  createdBy: input.createdBy || null,
  dataOriginCountries: input.dataOriginCountries,
  displayName: input.displayName || "",
  licenseExpirationDate: inputToDate(input.licenseExpirationDate),
  licenseType: input.licenseType,
  mayAutoRenew: input.mayAutoRenew,
  mayModifyData: input.mayModifyData,
  mustDestroy: input.mustDestroy,
  mustNotifyOnDeidFailure: input.mustNotifyOnDeidFailure,
  mustNotifyOnDeidFailureWithinDays: parseIntOrNull(
    input.mustNotifyOnDeidFailureWithinDays
  ),
  name: input.name || "",
  phiDeidMethod: input.phiDeidMethod,
  phiDeidHipaaMethod: input.phiDeidHipaaMethod || null,
  phiDeidOtherMethod: input.phiDeidOtherMethod || null,
  status: input.status,
  version: parseIntOrNull(input.version),
});

export const toContractRecord = (
  contract: Contract & { vendor: Vendor | null; contractData: ContractData[] }
): ContractRecord => {
  const latest = contract.contractData[0] ?? null;
  const data: ContractDataInput = latest
    ? {
        acquisitionDate: dateToInput(latest.acquisitionDate),
        additionalInformation: latest.additionalInformation ?? "",
        allowedDataModifications: latest.allowedDataModifications,
        allowedStorageCountries: latest.allowedStorageCountries,
        allowedStorageMethod: latest.allowedStorageMethod,
        allowedUsages: latest.allowedUsages,
        autoRenewalDate: dateToInput(latest.autoRenewalDate),
        contractExpirationDate: dateToInput(latest.contractExpirationDate),
        contractLocation: latest.contractLocation,
        createdBy: latest.createdBy ?? "",
        dataOriginCountries: latest.dataOriginCountries,
        displayName: latest.displayName,
        licenseExpirationDate: dateToInput(latest.licenseExpirationDate),
        licenseType: latest.licenseType,
        mayAutoRenew: latest.mayAutoRenew,
        mayModifyData: latest.mayModifyData,
        mustDestroy: latest.mustDestroy,
        mustNotifyOnDeidFailure: latest.mustNotifyOnDeidFailure,
        mustNotifyOnDeidFailureWithinDays:
          latest.mustNotifyOnDeidFailureWithinDays?.toString() ?? "",
        name: latest.name,
        phiDeidMethod: latest.phiDeidMethod,
        phiDeidHipaaMethod: latest.phiDeidHipaaMethod ?? "",
        phiDeidOtherMethod: latest.phiDeidOtherMethod ?? "",
        status: latest.status,
        version: latest.version?.toString() ?? "",
      }
    : defaultContractDataInput();

  return {
    id: contract.id,
    contractDataId: latest ? latest.id.toString() : null,
    vendorId: contract.vendorId,
    vendorName: contract.vendor?.name ?? "",
    fileName: contract.fileName,
    filePath: contract.filePath,
    rawText: contract.rawText,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
    data,
  };
};

export const toContractListItem = (
  contract: Contract & { vendor: Vendor | null; contractData: ContractData[] }
): ContractListItem => {
  const latest = contract.contractData[0] ?? null;

  return {
    id: contract.id,
    status: latest?.status ?? "parsing",
    fileName: contract.fileName,
    displayName: latest?.displayName || latest?.name || contract.fileName || contract.id,
    vendorName: contract.vendor?.name ?? "-",
    licenseType: latest?.licenseType ?? LicenseType.limited,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
  };
};

export const getVendorNameFromBody = (body: unknown): string => {
  const record = (body ?? {}) as Record<string, unknown>;
  return typeof record.vendorName === "string" ? record.vendorName.trim() : "";
};

export const parseStringListFromBody = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return splitList(value);
  }
  return [];
};
