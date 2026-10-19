import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/wishes/[id]/like - Thả tim lời chúc
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wish = await prisma.wish.update({
      where: { id },
      data: {
        hearts: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, hearts: wish.hearts });
  } catch (error) {
    console.error("Error liking wish:", error);
    return NextResponse.json(
      { success: false, message: "Không thể thả tim lời chúc" },
      { status: 500 }
    );
  }
}
