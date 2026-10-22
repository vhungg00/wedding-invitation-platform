import { PrismaClient } from "@prisma/client";

export interface WeddingPerson {
  name?: string;
  shortName?: string;
  avatar?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
}

export interface WeddingSolarDate {
  day?: number;
  month?: number;
  year?: number;
}

export interface WeddingEvent {
  side?: string;
  title?: string;
  subtitle?: string;
  time?: string;
  dayOfWeek?: string;
  solarDate?: WeddingSolarDate;
  lunarDate?: string;
  venueName?: string;
  timeRange?: string;
  address?: string;
  mapUrl?: string;
}

export interface WeddingBankAccount {
  owner?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  qrCodeUrl?: string;
}

export interface WeddingDonation {
  thankYouMessage?: string;
  bankAccount?: WeddingBankAccount;
  bankAccounts?: WeddingBankAccount[];
}

export interface WeddingHero {
  title?: string;
  backgroundImage?: string;
  weddingDateText?: string;
  dateFormatted?: string;
}

export interface WeddingSideData {
  title?: string;
  description?: string;
  hero?: WeddingHero;
  events?: WeddingEvent[];
  donation?: WeddingDonation;
  bride?: WeddingPerson;
  groom?: WeddingPerson;
}

export interface WeddingQuotes {
  line1?: string;
  line2?: string;
}

export interface WeddingCalendar {
  month?: number;
  year?: number;
  weddingDay?: number;
}

export interface PhotoItem {
  src?: string;
  url?: string;
  alt?: string;
  aos?: string;
  aosAnimation?: string;
}

export interface InvitationImageItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface InvitationContent {
  title?: string;
  description?: string;
  groom?: WeddingPerson;
  bride?: WeddingPerson;
  nhaTrai?: WeddingSideData;
  nhaGai?: WeddingSideData;
  hero?: WeddingHero;
  events?: WeddingEvent[];
  quotes?: WeddingQuotes;
  calendar?: WeddingCalendar;
  donation?: WeddingDonation;
}

export interface InvitationModel {
  id: string;
  slug: string;
  groomAvatar: string | null;
  brideAvatar: string | null;
  heroBackground: string | null;
  qrCodeUrl: string | null;
  qrCodeNhaTrai?: string | null;
  qrCodeNhaGai?: string | null;
  album?: PhotoItem[] | null;
  invitationImages?: InvitationImageItem[] | null;
  content?: InvitationContent | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationDelegate {
  findUnique(args: { where: { slug?: string; id?: string } }): Promise<InvitationModel | null>;
  findFirst(args?: { where?: { slug?: string; id?: string } }): Promise<InvitationModel | null>;
  findMany(args?: Record<string, unknown>): Promise<InvitationModel[]>;
  upsert(args: {
    where: { slug: string };
    update: Partial<Omit<InvitationModel, "id" | "createdAt" | "updatedAt">>;
    create: Partial<InvitationModel> & { slug: string };
  }): Promise<InvitationModel>;
  update(args: {
    where: { slug?: string; id?: string };
    data: Partial<Omit<InvitationModel, "id" | "createdAt" | "updatedAt">>;
  }): Promise<InvitationModel>;
  create(args: {
    data: Partial<InvitationModel> & { slug: string };
  }): Promise<InvitationModel>;
  delete(args: { where: { slug?: string; id?: string } }): Promise<InvitationModel>;
}

export type AppPrismaClient = PrismaClient & {
  invitation: InvitationDelegate;
};

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

export const prisma: AppPrismaClient = (globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })) as AppPrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
