export interface RsvpItem {
  id: string;
  name: string;
  phone: string | null;
  attending: boolean;
  guestCount: number;
  side: string;
  note: string | null;
  createdAt: string;
}

export interface WishItem {
  id: string;
  name: string;
  relationship: string | null;
  content: string;
  hearts: number;
  side: string;
  isApproved: boolean;
  createdAt: string;
}

export interface GuestItem {
  id: string;
  name: string;
  slug: string | null;
  side: "nha-trai" | "nha-gai" | string;
  group?: string | null;
  table?: string | null;
  isSent?: boolean;
  phone: string | null;
  note: string | null;
  createdAt: string;
  rsvps?: RsvpItem[];
  gifts?: GiftItem[];
}

export interface GiftItem {
  id: string;
  guestName: string;
  amount: number;
  side: "nha-trai" | "nha-gai" | string;
  method: "QR" | "CASH" | string;
  status: "RECEIVED" | "PENDING" | string;
  phone?: string | null;
  note?: string | null;
  guestId?: string | null;
  guest?: {
    id: string;
    name: string;
    slug?: string | null;
    phone?: string | null;
  } | null;
  createdAt: string;
}

export interface StatsData {
  totalRsvps: number;
  totalAttendingCount: number;
  declinedCount: number;
  nhaTraiGuestsCount: number;
  nhaGaiGuestsCount: number;
  totalWishes: number;
  totalGuests: number;
  totalGiftAmount?: number;
  totalGiftsCount?: number;
}

