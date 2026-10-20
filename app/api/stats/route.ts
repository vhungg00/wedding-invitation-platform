import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/stats - Thống kê tổng quan cho Admin
export async function GET() {
  try {
    const [
      totalRsvps,
      attendingRsvps,
      declinedRsvps,
      nhaTraiRsvps,
      nhaGaiRsvps,
      totalWishes,
      totalGuests,
      receivedGifts,
      recentRsvps,
    ] = await Promise.all([
      prisma.rsvp.count(),
      prisma.rsvp.findMany({ where: { attending: true } }),
      prisma.rsvp.count({ where: { attending: false } }),
      prisma.rsvp.findMany({ where: { side: "nha-trai", attending: true } }),
      prisma.rsvp.findMany({ where: { side: "nha-gai", attending: true } }),
      prisma.wish.count(),
      prisma.guest.count(),
      prisma.gift.findMany({ where: { status: "RECEIVED" } }),
      prisma.rsvp.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalAttendingGuests = attendingRsvps.reduce(
      (sum, r) => sum + (r.guestCount || 1),
      0
    );

    const nhaTraiGuestsCount = nhaTraiRsvps.reduce(
      (sum, r) => sum + (r.guestCount || 1),
      0
    );

    const nhaGaiGuestsCount = nhaGaiRsvps.reduce(
      (sum, r) => sum + (r.guestCount || 1),
      0
    );

    const totalGiftAmount = receivedGifts.reduce(
      (sum, g) => sum + (g.amount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRsvps,
        totalAttendingCount: totalAttendingGuests,
        declinedCount: declinedRsvps,
        nhaTraiGuestsCount,
        nhaGaiGuestsCount,
        totalWishes,
        totalGuests,
        totalGiftAmount,
        totalGiftsCount: receivedGifts.length,
        recentRsvps,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy số liệu thống kê" },
      { status: 500 }
    );
  }
}
