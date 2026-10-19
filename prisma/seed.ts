import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample data...");

  // Sample wishes
  const wishesCount = await prisma.wish.count();
  if (wishesCount === 0) {
    await prisma.wish.createMany({
      data: [
        {
          name: "Trần Đức Nam",
          relationship: "Bạn Chú Rể",
          content: "Chúc hai bạn trăm năm tình viên mãn, bạc đầu nghĩa phu thê! Sớm sinh quý tử nhé anh em ơi! 🎉🎉",
          hearts: 8,
          side: "nha-trai",
          isApproved: true,
        },
        {
          name: "Nguyễn Mai Phương",
          relationship: "Bạn Cô Dâu",
          content: "Chúc Xuân Ly của chúng mình luôn là cô dâu xinh đẹp và hạnh phúc nhất trần đời! Yêu hai bạn thật nhiều 💕",
          hearts: 12,
          side: "nha-gai",
          isApproved: true,
        },
        {
          name: "Gia đình Bác Thành",
          relationship: "Gia Đình & Họ Hàng",
          content: "Chúc hai cháu xây dựng tổ ấm hạnh phúc, hòa thuận, làm ăn phát đạt, cùng nhau vun đắp tương lai tươi sáng.",
          hearts: 5,
          side: "both",
          isApproved: true,
        },
      ],
    });
    console.log("Sample wishes seeded!");
  }

  // Sample RSVPs
  const rsvpsCount = await prisma.rsvp.count();
  if (rsvpsCount === 0) {
    await prisma.rsvp.createMany({
      data: [
        {
          name: "Trần Đức Nam",
          phone: "0987654321",
          attending: true,
          guestCount: 2,
          side: "nha-trai",
          note: "Sẽ đến sớm phụ giúp chú rể nhé!",
        },
        {
          name: "Nguyễn Mai Phương",
          phone: "0912345678",
          attending: true,
          guestCount: 1,
          side: "nha-gai",
          note: "Đón chờ cô dâu lộng lẫy!",
        },
      ],
    });
    console.log("Sample RSVPs seeded!");
  }

  // Sample Guest links
  const guestsCount = await prisma.guest.count();
  if (guestsCount === 0) {
    await prisma.guest.createMany({
      data: [
        {
          name: "Anh Hoàng",
          slug: "anh-hoang-1001",
          side: "nha-trai",
          phone: "0901234567",
        },
        {
          name: "Chị Thảo & Gia đình",
          slug: "chi-thao-gia-dinh-1002",
          side: "nha-gai",
          phone: "0907654321",
        },
      ],
    });
    console.log("Sample guests seeded!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
