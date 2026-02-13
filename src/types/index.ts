import type {
  ContractStatus,
  DataModificationType,
  DataUsageType,
  LicenseType,
  PhiDeidHipaaMethod,
  PhiDeidMethod,
  StorageMethod,
  Trilean,
} from "@/generated/prisma/enums";

export interface ContractDataInput {
  acquisitionDate: string;
  additionalInformation: string;
  allowedDataModifications: DataModificationType[];
  allowedStorageCountries: string[];
  allowedStorageMethod: StorageMethod;
  allowedUsages: DataUsageType[];
  autoRenewalDate: string;
  contractExpirationDate: string;
  contractLocation: string;
  createdBy: string;
  dataOriginCountries: string[];
  displayName: string;
  licenseExpirationDate: string;
  licenseType: LicenseType;
  mayAutoRenew: Trilean;
  mayModifyData: Trilean;
  mustDestroy: Trilean;
  mustNotifyOnDeidFailure: boolean;
  mustNotifyOnDeidFailureWithinDays: string;
  name: string;
  phiDeidMethod: PhiDeidMethod;
  phiDeidHipaaMethod: PhiDeidHipaaMethod | "";
  phiDeidOtherMethod: string;
  status: ContractStatus;
  version: string;
}

export interface ContractRecord {
  id: string;
  contractDataId: string | null;
  vendorId: string | null;
  vendorName: string;
  fileName: string | null;
  filePath: string | null;
  rawText: string | null;
  createdAt: string;
  updatedAt: string;
  data: ContractDataInput;
}

export interface ContractListItem {
  id: string;
  status: ContractStatus | "parsing";
  fileName: string | null;
  displayName: string;
  vendorName: string;
  licenseType: LicenseType;
  createdAt: string;
  updatedAt: string;
}
