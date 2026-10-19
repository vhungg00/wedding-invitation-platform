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
  side: string;
  phone: string | null;
  note: string | null;
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
}
