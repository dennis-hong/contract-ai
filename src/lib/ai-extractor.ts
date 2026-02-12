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

const EXTRACTION_PROMPT = `You are a contract data extraction assistant. You will be given the raw text of a Korean medical data purchase agreement (의료 데이터 구매 계약서).

Extract the following fields from the contract text. Return ONLY valid JSON with these exact keys:

{
  "contractName": "계약서 제목/명칭",
  "partyACompany": "갑(구매자) 회사명",
  "partyARepresentative": "갑 대표자",
  "partyAAddress": "갑 주소",
  "partyABusinessNo": "갑 사업자등록번호",
  "partyBCompany": "을(판매자) 회사명",
  "partyBRepresentative": "을 대표자",
  "partyBAddress": "을 주소",
  "partyBBusinessNo": "을 사업자등록번호",
  "dataScope": "데이터 범위 (유형, 기간, 대상 등을 요약)",
  "recordCount": "데이터 건수",
  "contractAmount": "계약 금액",
  "startDate": "계약 시작일 (YYYY-MM-DD)",
  "endDate": "계약 종료일 (YYYY-MM-DD)",
  "securityLevel": "보안 등급",
  "specialTerms": "특약사항 (주요 내용 요약)"
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

  const contractName =
    extract(/^(.*계약서.*)$/m) ?? "의료 데이터 구매 계약서";

  const partyACompany =
    extract(/갑.*?구매자.*?\n\s*회사명[:\s]*(.+)/m) ??
    extract(/구매자.*?\n\s*회사명[:\s]*(.+)/m);

  const partyARepresentative =
    extract(/갑.*?구매자[\s\S]*?대표자[:\s]*(.+)/m);

  const partyAAddress =
    extract(/갑.*?구매자[\s\S]*?주소[:\s]*(.+)/m);

  const partyABusinessNo =
    extract(/갑.*?구매자[\s\S]*?사업자등록번호[:\s]*([\d-]+)/m);

  const partyBCompany =
    extract(/을.*?판매자.*?\n\s*회사명[:\s]*(.+)/m) ??
    extract(/판매자.*?\n\s*회사명[:\s]*(.+)/m);

  const partyBRepresentative =
    extract(/을.*?판매자[\s\S]*?대표자[:\s]*(.+)/m);

  const partyBAddress =
    extract(/을.*?판매자[\s\S]*?주소[:\s]*(.+)/m);

  const partyBBusinessNo =
    extract(/을.*?판매자[\s\S]*?사업자등록번호[:\s]*([\d-]+)/m);

  const dataScope = extract(/데이터\s*유형[:\s]*(.+)/m);
  const recordCount =
    extract(/데이터\s*건수[:\s]*(?:총\s*)?(.+)/m) ??
    extract(/총\s*([\d,]+)\s*건/m);
  const contractAmount =
    extract(/총\s*계약\s*금액[:\s]*(.+)/m) ??
    extract(/계약\s*금액[:\s]*(.+)/m);
  const startDate = extract(/계약\s*시작일[:\s]*(.+)/m);
  const endDate = extract(/계약\s*종료일[:\s]*(.+)/m);
  const securityLevel = extract(/보안\s*등급[:\s]*(.+)/m);

  // Extract special terms
  const specialTermsMatch = rawText.match(
    /특약사항[\s\S]*?((?:\d+\..*\n?)+)/m
  );
  const specialTerms = specialTermsMatch
    ? specialTermsMatch[1]?.trim() ?? null
    : null;

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
