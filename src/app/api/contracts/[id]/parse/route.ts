import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/db";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractContractData } from "@/lib/ai-extractor";
import {
  extractedToInput,
  toContractDataUpdateInput,
  toContractDataWriteInput,
  toContractRecord,
} from "@/lib/contract-data";
import { ContractStatus } from "@/generated/prisma/enums";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        contractData: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    if (!contract.filePath) {
      return NextResponse.json(
        { error: "Contract file is missing" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "uploads", contract.filePath);
    const rawText = (await extractTextFromPDF(filePath)).replace(/\x00/g, "");
    const extracted = await extractContractData(rawText);
    const input = extractedToInput(extracted);
    const latestData = contract.contractData[0] ?? null;

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        rawText,
        vendor: extracted.vendorName
          ? {
              connectOrCreate: {
                where: { name: extracted.vendorName },
                create: { name: extracted.vendorName },
              },
            }
          : undefined,
        contractData: latestData
          ? {
              update: {
                where: { id: latestData.id },
                data: toContractDataUpdateInput({
                  ...input,
                  status: ContractStatus.in_review,
                }),
              },
            }
          : {
              create: toContractDataWriteInput({
                ...input,
                status: ContractStatus.in_review,
              }),
            },
      },
      include: {
        vendor: true,
        contractData: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(toContractRecord(updated));
  } catch (error) {
    console.error("Re-parse error:", error);
    return NextResponse.json(
      { error: "Failed to re-parse contract" },
      { status: 500 }
    );
  }
}
