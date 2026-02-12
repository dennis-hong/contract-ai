import OpenAI from "openai";

export interface ExtractedContractData {
  contractName: string | null;
  partyACompany: string | null;
  partyARepresentative: string | null;
  partyAAddress: string | null;
  partyABusinessNo: string | null;
  partyBCompany: string | null;
  partyBRepresentative: string | null;
  partyBAddress: string | null;
  partyBBusinessNo: string | null;
  dataScope: string | null;
  recordCount: string | null;
  contractAmount: string | null;
  startDate: string | null;
  endDate: string | null;
  securityLevel: string | null;
  specialTerms: string | null;
}

const EXTRACTION_PROMPT = `You are a contract data extraction assistant. You will be given the raw text of a medical data purchase agreement. The contract may be written in Korean (의료 데이터 구매 계약서) or English.

For Korean contracts:
- 갑 (甲) = Party A (Buyer/Purchaser)
- 을 (乙) = Party B (Seller/Provider)
- 사업자등록번호 = Business Registration Number

For English contracts:
- Party A / Buyer / Purchaser = 갑
- Party B / Seller / Provider = 을
- EIN / Tax ID / Registration No. = Business Registration Number

Extract the following fields from the contract text. Return ONLY valid JSON with these exact keys:

{
  "contractName": "Contract title/name",
  "partyACompany": "Party A (Buyer) company name",
  "partyARepresentative": "Party A representative",
  "partyAAddress": "Party A address",
  "partyABusinessNo": "Party A business/tax registration number",
  "partyBCompany": "Party B (Seller) company name",
  "partyBRepresentative": "Party B representative",
  "partyBAddress": "Party B address",
  "partyBBusinessNo": "Party B business/tax registration number",
  "dataScope": "Data scope (type, period, subjects - summarize)",
  "recordCount": "Number of data records",
  "contractAmount": "Contract amount (include currency)",
  "startDate": "Contract start date (YYYY-MM-DD)",
  "endDate": "Contract end date (YYYY-MM-DD)",
  "securityLevel": "Security level/classification",
  "specialTerms": "Special terms (summarize key points)"
}

If a field cannot be found, set its value to null.
Return ONLY the JSON object, no additional text.`;

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

  return JSON.parse(content) as ExtractedContractData;
}

function fallbackExtraction(rawText: string): ExtractedContractData {
  const extract = (pattern: RegExp): string | null => {
    const match = rawText.match(pattern);
    return match ? match[1]?.trim() ?? null : null;
  };

  // Detect language
  const isKorean = /[가-힣]/.test(rawText);

  let contractName: string | null;
  let partyACompany: string | null;
  let partyARepresentative: string | null;
  let partyAAddress: string | null;
  let partyABusinessNo: string | null;
  let partyBCompany: string | null;
  let partyBRepresentative: string | null;
  let partyBAddress: string | null;
  let partyBBusinessNo: string | null;
  let dataScope: string | null;
  let recordCount: string | null;
  let contractAmount: string | null;
  let startDate: string | null;
  let endDate: string | null;
  let securityLevel: string | null;
  let specialTerms: string | null;

  if (isKorean) {
    contractName =
      extract(/^(.*계약서.*)$/m) ?? "의료 데이터 구매 계약서";

    partyACompany =
      extract(/갑.*?구매자.*?\n\s*회사명[:\s]*(.+)/m) ??
      extract(/구매자.*?\n\s*회사명[:\s]*(.+)/m);
    partyARepresentative =
      extract(/갑.*?구매자[\s\S]*?대표자[:\s]*(.+)/m);
    partyAAddress =
      extract(/갑.*?구매자[\s\S]*?주소[:\s]*(.+)/m);
    partyABusinessNo =
      extract(/갑.*?구매자[\s\S]*?사업자등록번호[:\s]*([\d-]+)/m);

    partyBCompany =
      extract(/을.*?판매자.*?\n\s*회사명[:\s]*(.+)/m) ??
      extract(/판매자.*?\n\s*회사명[:\s]*(.+)/m);
    partyBRepresentative =
      extract(/을.*?판매자[\s\S]*?대표자[:\s]*(.+)/m);
    partyBAddress =
      extract(/을.*?판매자[\s\S]*?주소[:\s]*(.+)/m);
    partyBBusinessNo =
      extract(/을.*?판매자[\s\S]*?사업자등록번호[:\s]*([\d-]+)/m);

    dataScope = extract(/데이터\s*유형[:\s]*(.+)/m);
    recordCount =
      extract(/데이터\s*건수[:\s]*(?:총\s*)?(.+)/m) ??
      extract(/총\s*([\d,]+)\s*건/m);
    contractAmount =
      extract(/총\s*계약\s*금액[:\s]*(.+)/m) ??
      extract(/계약\s*금액[:\s]*(.+)/m);
    startDate = extract(/계약\s*시작일[:\s]*(.+)/m);
    endDate = extract(/계약\s*종료일[:\s]*(.+)/m);
    securityLevel = extract(/보안\s*등급[:\s]*(.+)/m);

    const specialTermsMatch = rawText.match(
      /특약사항[\s\S]*?((?:\d+\..*\n?)+)/m
    );
    specialTerms = specialTermsMatch
      ? specialTermsMatch[1]?.trim() ?? null
      : null;
  } else {
    contractName =
      extract(/^(.*(?:Agreement|Contract).*)$/im) ?? "Medical Data Purchase Agreement";

    partyACompany =
      extract(/(?:Party\s*A|Buyer|Purchaser).*?(?:Company|Name)[:\s]*(.+)/im) ??
      extract(/(?:Party\s*A|Buyer|Purchaser)[:\s]*(.+)/im);
    partyARepresentative =
      extract(/(?:Party\s*A|Buyer)[\s\S]*?(?:Representative|CEO|Director)[:\s]*(.+)/im);
    partyAAddress =
      extract(/(?:Party\s*A|Buyer)[\s\S]*?(?:Address)[:\s]*(.+)/im);
    partyABusinessNo =
      extract(/(?:Party\s*A|Buyer)[\s\S]*?(?:EIN|Tax\s*ID|Registration)[:\s]*([\d-]+)/im);

    partyBCompany =
      extract(/(?:Party\s*B|Seller|Provider).*?(?:Company|Name)[:\s]*(.+)/im) ??
      extract(/(?:Party\s*B|Seller|Provider)[:\s]*(.+)/im);
    partyBRepresentative =
      extract(/(?:Party\s*B|Seller)[\s\S]*?(?:Representative|CEO|Director)[:\s]*(.+)/im);
    partyBAddress =
      extract(/(?:Party\s*B|Seller)[\s\S]*?(?:Address)[:\s]*(.+)/im);
    partyBBusinessNo =
      extract(/(?:Party\s*B|Seller)[\s\S]*?(?:EIN|Tax\s*ID|Registration)[:\s]*([\d-]+)/im);

    dataScope = extract(/(?:Data\s*(?:Scope|Type))[:\s]*(.+)/im);
    recordCount =
      extract(/(?:Record\s*Count|Number\s*of\s*Records)[:\s]*(.+)/im) ??
      extract(/([\d,]+)\s*records/im);
    contractAmount =
      extract(/(?:Total\s*(?:Contract\s*)?Amount|Contract\s*(?:Value|Price))[:\s]*(.+)/im);
    startDate =
      extract(/(?:Start\s*Date|Effective\s*Date|Commencement)[:\s]*(.+)/im);
    endDate =
      extract(/(?:End\s*Date|Expiration|Termination\s*Date)[:\s]*(.+)/im);
    securityLevel =
      extract(/(?:Security\s*(?:Level|Classification))[:\s]*(.+)/im);

    const specialTermsMatch = rawText.match(
      /(?:Special\s*Terms|Additional\s*Provisions)[\s\S]*?((?:\d+\..*\n?)+)/im
    );
    specialTerms = specialTermsMatch
      ? specialTermsMatch[1]?.trim() ?? null
      : null;
  }

  return {
    contractName,
    partyACompany,
    partyARepresentative,
    partyAAddress,
    partyABusinessNo,
    partyBCompany,
    partyBRepresentative,
    partyBAddress,
    partyBBusinessNo,
    dataScope,
    recordCount,
    contractAmount,
    startDate,
    endDate,
    securityLevel,
    specialTerms,
  };
}
