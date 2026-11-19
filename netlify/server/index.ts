import { Hono } from "hono";
import Anthropic from "@anthropic-ai/sdk";
import { and, desc, eq, gte, lte, ne } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { bookings } from "../../db/schema.ts";
import { FLEET_DATA, PARTNERS_DATA, BOOKING_STATUSES } from "../../src/data/catalog.js";

export const config = {
  path: "/api/*",
};

const app = new Hono();
const anthropic = new Anthropic();
const AI_MODEL = "claude-sonnet-5-5";

type BookingRow = typeof bookings.$inferSelect;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function int(v: unknown, fallback = 0): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : fallback;
}

function daysBetween(start: string, end: string): number {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.floor(ms / 86400000) + 1;
}

function todayWIB(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

function generateCode(): string {
  const d = todayWIB().replace(/-/g, "").slice(2);
  const rand = Math.floor(100 + Math.random() * 900);
  const tail = Date.now().toString(36).slice(-2).toUpperCase();
  return `TRV-${d}-${rand}${tail}`;
}

async function findConflict(busId: string, startDate: string, endDate: string, excludeId?: string) {
  const conditions = [
    eq(bookings.busId, busId),
    ne(bookings.status, "Dibatalkan"),
    lte(bookings.startDate, endDate),
    gte(bookings.endDate, startDate),
  ];
  if (excludeId) conditions.push(ne(bookings.id, excludeId));
  const [conflict] = await db.select().from(bookings).where(and(...conditions)).limit(1);
  return conflict ?? null;
}

type ParsedBooking = {
  error?: string;
  value?: Omit<typeof bookings.$inferInsert, "id" | "bookingCode">;
};

function parseBookingInput(body: any, { admin }: { admin: boolean }): ParsedBooking {
  const bus = FLEET_DATA.find((b) => b.id === body?.busId);
  if (!bus) return { error: "Armada bus tidak valid." };

  const startDate = str(body.startDate, 10);
  const endDate = str(body.endDate, 10) || startDate;
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate) || endDate < startDate) {
    return { error: "Tanggal perjalanan tidak valid." };
  }
  if (!admin && startDate < todayWIB()) {
    return { error: "Tanggal keberangkatan tidak boleh di masa lalu." };
  }
  const days = daysBetween(startDate, endDate);
  if (days > 30) return { error: "Durasi sewa maksimal 30 hari." };

  const destination = str(body.destination, 200);
  if (!destination) return { error: "Tujuan wisata wajib diisi." };

  const partner = PARTNERS_DATA.find((p) => p.id === body.partnerId);
  const partnerName = str(body.partnerName, 120) || partner?.name || "";
  const picName = str(body.picName, 120) || partner?.pic || "";
  const picPhone = str(body.picPhone, 40) || partner?.phone || "";
  if (!partnerName) return { error: "Nama biro / rombongan wajib diisi." };
  if (!admin && (!picName || !picPhone)) {
    return { error: "Nama dan nomor telepon penanggung jawab wajib diisi." };
  }

  const passengers = Math.min(bus.capacity, Math.max(1, int(body.passengers, 1)));
  const tollFuelEstimate = Math.max(0, int(body.tollFuel ?? body.tollFuelEstimate, 0));
  const baseRate = bus.dailyRate;
  const computed = days * baseRate + tollFuelEstimate;
  // Harga final hanya boleh ditentukan admin; publik mendapat estimasi standar.
  const dealPrice = admin ? Math.max(0, int(body.dealPrice, computed)) : computed;

  const status = admin && BOOKING_STATUSES.includes(body.status) ? body.status : admin ? "Terkonfirmasi" : "Menunggu Konfirmasi";

  return {
    value: {
      partnerId: partner?.id ?? null,
      partnerName,
      picName,
      picPhone,
      picEmail: str(body.picEmail, 160),
      busId: bus.id,
      busName: bus.name,
      plateNumber: bus.plateNumber,
      destination,
      startDate,
      endDate,
      days,
      passengers,
      baseRate,
      tollFuelEstimate,
      dealPrice,
      status,
      source: admin ? "admin" : "publik",
      notes: str(body.notes, 1000),
      adminNotes: admin ? str(body.adminNotes, 1000) : "",
    },
  };
}

// ---------------------------------------------------------------------------
// Admin authentication (Netlify Identity)
// ---------------------------------------------------------------------------

type AdminUser = { id: string; email: string; name: string; roles: string[] };
const tokenCache = new Map<string, { user: AdminUser | null; expires: number }>();

function readToken(c: any): string | null {
  const auth = c.req.header("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)nf_jwt=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function resolveUser(c: any): Promise<AdminUser | null> {
  const token = readToken(c);
  if (!token) return null;
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) return cached.user;

  let user: AdminUser | null = null;
  try {
    const origin = new URL(c.req.url).origin;
    const res = await fetch(`${origin}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: any = await res.json();
      user = {
        id: data.id,
        email: String(data.email || "").toLowerCase(),
        name: data.user_metadata?.full_name || data.email,
        roles: Array.isArray(data.app_metadata?.roles) ? data.app_metadata.roles : [],
      };
    }
  } catch (err) {
    console.error("Identity verification failed", err);
  }
  if (tokenCache.size > 500) tokenCache.clear();
  tokenCache.set(token, { user, expires: Date.now() + 60_000 });
  return user;
}

function isAdmin(user: AdminUser): boolean {
  if (user.roles.includes("admin")) return true;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(user.email);
}

app.use("/api/admin/*", async (c, next) => {
  // Lindungi permintaan yang mengubah data dari situs lain (CSRF)
  if (c.req.method !== "GET") {
    const origin = c.req.header("origin");
    if (origin && origin !== new URL(c.req.url).origin) {
      return c.json({ error: "Origin tidak diizinkan." }, 403);
    }
  }
  const user = await resolveUser(c);
  if (!user) return c.json({ error: "Silakan masuk sebagai admin." }, 401);
  if (!isAdmin(user)) {
    return c.json({ error: "Akun ini belum memiliki hak akses admin.", email: user.email }, 403);
  }
  c.set("user" as never, user as never);
  await next();
});

// ---------------------------------------------------------------------------
// Public routes — hanya data yang aman untuk pengunjung
// ---------------------------------------------------------------------------

app.get("/api/public/availability", async (c) => {
  const rows = await db
    .select({ busId: bookings.busId, startDate: bookings.startDate, endDate: bookings.endDate, status: bookings.status })
    .from(bookings)
    .where(ne(bookings.status, "Dibatalkan"));
  return c.json({ fleet: FLEET_DATA, blocked: rows });
});

app.post("/api/public/bookings", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = parseBookingInput(body, { admin: false });
  if (parsed.error || !parsed.value) return c.json({ error: parsed.error }, 400);
  const v = parsed.value;

  const conflict = await findConflict(v.busId, v.startDate, v.endDate);
  if (conflict) {
    return c.json({ error: `Armada ${v.busName} sudah terisi pada rentang tanggal tersebut. Silakan pilih tanggal lain.` }, 409);
  }

  const code = generateCode();
  const [row] = await db.insert(bookings).values({ ...v, id: code, bookingCode: code }).returning();
  return c.json(
    {
      booking: {
        bookingCode: row.bookingCode,
        busName: row.busName,
        startDate: row.startDate,
        endDate: row.endDate,
        days: row.days,
        dealPrice: row.dealPrice,
        status: row.status,
      },
    },
    201
  );
});

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

app.get("/api/admin/me", (c) => c.json({ user: c.get("user" as never) }));

app.get("/api/admin/data", async (c) => {
  const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  return c.json({ fleet: FLEET_DATA, partners: PARTNERS_DATA, bookings: rows, lastSync: new Date().toISOString() });
});

app.post("/api/admin/bookings", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = parseBookingInput(body, { admin: true });
  if (parsed.error || !parsed.value) return c.json({ error: parsed.error }, 400);
  const v = parsed.value;
  if (v.status !== "Dibatalkan") {
    const conflict = await findConflict(v.busId, v.startDate, v.endDate);
    if (conflict) {
      return c.json({ error: `Bentrok dengan ${conflict.partnerName} (${conflict.bookingCode}).` }, 409);
    }
  }
  const code = generateCode();
  const [row] = await db.insert(bookings).values({ ...v, id: code, bookingCode: code }).returning();
  return c.json({ booking: row }, 201);
});

app.patch("/api/admin/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const body: any = (await c.req.json().catch(() => null)) || {};
  const [existing] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!existing) return c.json({ error: "Reservasi tidak ditemukan." }, 404);

  const updates: Partial<BookingRow> = {};
  if (body.status !== undefined) {
    if (!BOOKING_STATUSES.includes(body.status)) return c.json({ error: "Status tidak valid." }, 400);
    updates.status = body.status;
  }
  if (body.dealPrice !== undefined) updates.dealPrice = Math.max(0, int(body.dealPrice, existing.dealPrice));
  if (body.adminNotes !== undefined) updates.adminNotes = str(body.adminNotes, 1000);

  const nextStatus = updates.status ?? existing.status;
  if (existing.status === "Dibatalkan" && nextStatus !== "Dibatalkan") {
    const conflict = await findConflict(existing.busId, existing.startDate, existing.endDate, existing.id);
    if (conflict) {
      return c.json({ error: `Tidak dapat diaktifkan: bentrok dengan ${conflict.partnerName} (${conflict.bookingCode}).` }, 409);
    }
  }

  const [row] = await db
    .update(bookings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  return c.json({ booking: row });
});

app.delete("/api/admin/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = await db.delete(bookings).where(eq(bookings.id, id)).returning({ id: bookings.id });
  if (!deleted.length) return c.json({ error: "Reservasi tidak ditemukan." }, 404);
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// AI Analyst
// ---------------------------------------------------------------------------

function buildOperationalContext(rows: BookingRow[]) {
  const today = todayWIB();
  const active = rows.filter((b) => b.status !== "Dibatalkan");
  const horizonEnd = new Date(Date.parse(`${today}T00:00:00Z`) + 59 * 86400000).toISOString().slice(0, 10);

  const fleetStats = FLEET_DATA.map((bus) => {
    const trips = active.filter((b) => b.busId === bus.id);
    let bookedNext60 = 0;
    for (const t of trips) {
      const s = t.startDate > today ? t.startDate : today;
      const e = t.endDate < horizonEnd ? t.endDate : horizonEnd;
      if (s <= e) bookedNext60 += daysBetween(s, e);
    }
    return {
      bus: bus.name,
      plate: bus.plateNumber,
      dailyRate: bus.dailyRate,
      totalTrips: trips.length,
      revenue: trips.reduce((a, t) => a + t.dealPrice, 0),
      bookedDaysNext60: bookedNext60,
      utilizationNext60Pct: Math.round((bookedNext60 / 60) * 100),
    };
  });

  const byMonth: Record<string, { trips: number; revenue: number }> = {};
  for (const b of active) {
    const m = b.startDate.slice(0, 7);
    byMonth[m] ??= { trips: 0, revenue: 0 };
    byMonth[m].trips += 1;
    byMonth[m].revenue += b.dealPrice;
  }

  const byStatus: Record<string, number> = {};
  for (const b of rows) byStatus[b.status] = (byStatus[b.status] || 0) + 1;

  const compact = rows.slice(0, 250).map((b) => ({
    code: b.bookingCode,
    status: b.status,
    source: b.source,
    partner: b.partnerName,
    bus: b.busName,
    destination: b.destination,
    start: b.startDate,
    end: b.endDate,
    days: b.days,
    pax: b.passengers,
    dealPrice: b.dealPrice,
    perDay: Math.round(b.dealPrice / Math.max(1, b.days)),
    tollFuel: b.tollFuelEstimate,
    notes: b.notes || undefined,
  }));

  return {
    today,
    company: "PO. Trevel Wisata Nusantara (bus pariwisata eksekutif Jawa Timur & Bali, pool Pandaan Pasuruan)",
    fleet: fleetStats,
    partners: PARTNERS_DATA.map((p) => ({ name: p.name, city: p.city, tier: p.tier, historicTrips: p.totalTrips, rating: p.rating })),
    byStatus,
    byMonth,
    bookings: compact,
  };
}

const SYSTEM_PROMPT = `Anda adalah "Trevel AI Analyst", analis bisnis senior untuk operator bus pariwisata PO. Trevel Wisata Nusantara.
Tugas Anda: membaca data operasional (JSON) yang diberikan dan menghasilkan analisis yang tajam, konkret, dan dapat ditindaklanjuti oleh manajemen.

Aturan:
- Selalu jawab dalam Bahasa Indonesia yang profesional dan ringkas.
- Gunakan format Markdown: judul "##", daftar "-", dan **tebal** untuk angka penting. Hindari tabel lebar.
- Tulis nominal dalam format Rupiah Indonesia, misalnya Rp11.700.000.
- Dasarkan setiap klaim pada data yang tersedia; sebutkan kode reservasi, nama mitra, armada, dan tanggal bila relevan.
- Bila data tidak cukup, katakan dengan jujur dan sarankan data apa yang perlu dikumpulkan.
- Jangan mengarang data yang tidak ada.`;

const INSIGHT_PROMPT = `Susun "Laporan Analisis Eksekutif" dengan bagian berikut:
## Ringkasan Eksekutif
(3 poin terpenting)
## Kinerja Pendapatan
## Utilisasi & Jadwal Armada
(sebutkan hari/rentang kosong 60 hari ke depan per bus dan peluang mengisinya)
## Reservasi yang Perlu Tindakan
(reservasi Menunggu Konfirmasi, keberangkatan 7 hari ke depan, catatan operasional berisiko)
## Mitra & Peluang Penjualan
## Rekomendasi Harga
## 5 Aksi Prioritas Minggu Ini
(daftar bernomor, masing-masing satu kalimat yang spesifik)`;

app.post("/api/admin/ai", async (c) => {
  const body: any = (await c.req.json().catch(() => null)) || {};
  const mode = body.mode === "chat" ? "chat" : "insight";

  const rows = await db.select().from(bookings).orderBy(desc(bookings.startDate));
  const context = buildOperationalContext(rows);
  const dataBlock = `DATA OPERASIONAL TERKINI (JSON):\n${JSON.stringify(context)}`;

  let messages: Anthropic.MessageParam[];
  if (mode === "chat") {
    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const cleaned = history
      .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
      return c.json({ error: "Pertanyaan tidak boleh kosong." }, 400);
    }
    while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
    cleaned[0] = { role: "user", content: `${dataBlock}\n\n---\n${cleaned[0].content}` };
    messages = cleaned;
  } else {
    messages = [{ role: "user", content: `${dataBlock}\n\n---\n${INSIGHT_PROMPT}` }];
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: AI_MODEL,
          max_tokens: mode === "chat" ? 1500 : 3000,
          system: SYSTEM_PROMPT,
          messages,
          stream: true,
        });
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err: any) {
        console.error("AI analysis failed", err);
        controller.enqueue(encoder.encode("\n\n> ⚠️ Analisis AI sedang tidak tersedia. Silakan coba beberapa saat lagi."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
});

app.notFound((c) => c.json({ error: "Endpoint tidak ditemukan." }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Terjadi kesalahan pada server." }, 500);
});

export default app;
