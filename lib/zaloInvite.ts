import { GuestItem } from "@/app/admin/types";

export const getInvitationMessage = (guest: GuestItem, origin: string) => {
  const path = guest.side === "nha-gai" ? "/nha-gai" : "";
  const guestUrl = `${origin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;
  const weddingDate =
    guest.side === "nha-gai"
      ? "Thứ Bảy, ngày 05.12.2026 (10h30)"
      : "Chủ Nhật, ngày 06.12.2026 (10h00)";
  const eventName = guest.side === "nha-gai" ? "Lễ Vu Quy" : "Lễ Thành Hôn";

  return `Thân gửi ${guest.name},

Hôn lễ của Việt Hùng & Xuân Ly (${eventName}) sẽ chính thức diễn ra vào ${weddingDate}.

Sự hiện diện của ${guest.name} là niềm vinh hạnh to lớn và trọn vẹn nhất cho ngày vui của hai đứa và gia đình chúng mình.

Chúng mình trân trọng gửi thiệp mời trực tiếp tới ${guest.name} tại đường dẫn dưới đây:
👉 ${guestUrl}

Rất mong được đón tiếp ${guest.name} cùng chung vui!
Thân ái,
Việt Hùng & Xuân Ly ❤️`;
};

export const sendZaloOneClick = async (
  guest: GuestItem,
  onSentUpdated?: (guestId: string) => void
) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const message = getInvitationMessage(guest, origin);

  // 1. Copy message to clipboard
  try {
    await navigator.clipboard.writeText(message);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }

  // 2. Mark isSent = true in database
  try {
    await fetch("/api/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guest.id, isSent: true }),
    });
    if (onSentUpdated) {
      onSentUpdated(guest.id);
    }
  } catch (err) {
    console.error("Failed to update isSent in DB:", err);
  }

  // 3. Open Zalo chat if phone exists
  const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, "") : "";
  if (cleanPhone) {
    window.open(`https://zalo.me/${cleanPhone}`, "_blank", "noopener,noreferrer");
    return { success: true, hasPhone: true, phone: cleanPhone };
  } else {
    return { success: true, hasPhone: false, message };
  }
};
