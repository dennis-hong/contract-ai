import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/db";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractContractData } from "@/lib/ai-extractor";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Update status to parsing
    await prisma.contract.update({
      where: { id },
      data: { status: "parsing" },
    });

    const filePath = path.join(process.cwd(), "uploads", contract.filePath);
    const rawText = await extractTextFromPDF(filePath);
    const extracted = await extractContractData(rawText);

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        rawText,
        status: "review",
        ...extracted,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Re-parse error:", error);
    return NextResponse.json(
      { error: "Failed to re-parse contract" },
      { status: 500 }
    );
  }
}
