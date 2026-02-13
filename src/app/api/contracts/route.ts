import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toContractListItem } from "@/lib/contract-data";

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        contractData: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(contracts.map(toContractListItem));
  } catch (error) {
    console.error("List contracts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
