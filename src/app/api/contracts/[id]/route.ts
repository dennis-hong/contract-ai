import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
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

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Get contract error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        contractName: body.contractName,
        partyACompany: body.partyACompany,
        partyARepresentative: body.partyARepresentative,
        partyAAddress: body.partyAAddress,
        partyABusinessNo: body.partyABusinessNo,
        partyBCompany: body.partyBCompany,
        partyBRepresentative: body.partyBRepresentative,
        partyBAddress: body.partyBAddress,
        partyBBusinessNo: body.partyBBusinessNo,
        dataScope: body.dataScope,
        recordCount: body.recordCount,
        contractAmount: body.contractAmount,
        startDate: body.startDate,
        endDate: body.endDate,
        securityLevel: body.securityLevel,
        specialTerms: body.specialTerms,
        status: body.status ?? "saved",
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Update contract error:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}
