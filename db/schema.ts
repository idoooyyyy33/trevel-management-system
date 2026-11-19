import { pgTable, text, integer, bigint, date, timestamp, index } from "drizzle-orm/pg-core";

// Reservasi charter bus (sumber data tunggal untuk publik & panel admin)
export const bookings = pgTable(
  "bookings",
  {
    id: text().primaryKey(),
    bookingCode: text("booking_code").notNull().unique(),
    partnerId: text("partner_id"),
    partnerName: text("partner_name").notNull(),
    picName: text("pic_name").notNull().default(""),
    picPhone: text("pic_phone").notNull().default(""),
    picEmail: text("pic_email").notNull().default(""),
    busId: text("bus_id").notNull(),
    busName: text("bus_name").notNull(),
    plateNumber: text("plate_number").notNull().default(""),
    destination: text().notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    days: integer().notNull().default(1),
    passengers: integer().notNull().default(1),
    baseRate: bigint("base_rate", { mode: "number" }).notNull().default(3500000),
    tollFuelEstimate: bigint("toll_fuel_estimate", { mode: "number" }).notNull().default(0),
    dealPrice: bigint("deal_price", { mode: "number" }).notNull().default(0),
    status: text().notNull().default("Menunggu Konfirmasi"),
    source: text().notNull().default("publik"),
    notes: text().notNull().default(""),
    adminNotes: text("admin_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("bookings_bus_dates_idx").on(t.busId, t.startDate, t.endDate)]
);
