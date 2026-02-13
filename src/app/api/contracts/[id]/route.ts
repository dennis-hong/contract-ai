import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  parseContractDataInput,
  toContractDataUpdateInput,
  toContractDataWriteInput,
  toContractRecord,
} from "@/lib/contract-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        vendor: true,
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

    return NextResponse.json(toContractRecord(contract));
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
    const body = (await request.json()) as {
      vendorName?: unknown;
      data?: unknown;
    };

    const existing = await prisma.contract.findUnique({
      where: { id },
      include: {
        contractData: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const vendorName = typeof body.vendorName === "string" ? body.vendorName.trim() : "";
    const parsedData = parseContractDataInput(body.data);
    const latestData = existing.contractData[0] ?? null;

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        vendor: vendorName
          ? {
              connectOrCreate: {
                where: { name: vendorName },
                create: { name: vendorName },
              },
            }
          : {
              disconnect: true,
            },
        contractData: latestData
          ? {
              update: {
                where: { id: latestData.id },
                data: toContractDataUpdateInput(parsedData),
              },
            }
          : {
              create: toContractDataWriteInput(parsedData),
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
    console.error("Update contract error:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}
