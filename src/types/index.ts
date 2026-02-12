export interface ContractFormData {
  contractName: string;
  partyACompany: string;
  partyARepresentative: string;
  partyAAddress: string;
  partyABusinessNo: string;
  partyBCompany: string;
  partyBRepresentative: string;
  partyBAddress: string;
  partyBBusinessNo: string;
  dataScope: string;
  recordCount: string;
  contractAmount: string;
  startDate: string;
  endDate: string;
  securityLevel: string;
  specialTerms: string;
}

export interface ContractRecord extends ContractFormData {
  id: string;
  status: "parsing" | "review" | "saved";
  fileName: string;
  filePath: string;
  rawText: string | null;
  createdAt: string;
  updatedAt: string;
}
