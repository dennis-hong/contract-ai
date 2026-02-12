import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractContractData } from "@/lib/ai-extractor";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Save the file
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileId = uuidv4();
    const fileName = `${fileId}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Create contract record with parsing status
    const contract = await prisma.contract.create({
      data: {
        fileName: file.name,
        filePath: fileName,
        status: "parsing",
      },
    });

    // Parse PDF and extract data in the background
    parsePDFAndExtract(contract.id, filePath).catch(console.error);

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

async function parsePDFAndExtract(contractId: string, filePath: string) {
  try {
    const rawText = await extractTextFromPDF(filePath);
    const extracted = await extractContractData(rawText);

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        rawText,
        status: "review",
        ...extracted,
      },
    });
  } catch (error) {
    console.error("Parse error:", error);
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "review",
        rawText: `Error parsing PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    });
  }
}
