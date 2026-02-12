import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        fileName: true,
        contractName: true,
        partyACompany: true,
        partyBCompany: true,
        contractAmount: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(contracts);
  } catch (error) {
    console.error("List contracts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
