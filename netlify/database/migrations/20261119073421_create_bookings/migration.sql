CREATE TABLE "bookings" (
	"id" text PRIMARY KEY,
	"booking_code" text NOT NULL UNIQUE,
	"partner_id" text,
	"partner_name" text NOT NULL,
	"pic_name" text DEFAULT '' NOT NULL,
	"pic_phone" text DEFAULT '' NOT NULL,
	"pic_email" text DEFAULT '' NOT NULL,
	"bus_id" text NOT NULL,
	"bus_name" text NOT NULL,
	"plate_number" text DEFAULT '' NOT NULL,
	"destination" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer DEFAULT 1 NOT NULL,
	"passengers" integer DEFAULT 1 NOT NULL,
	"base_rate" bigint DEFAULT 3500000 NOT NULL,
	"toll_fuel_estimate" bigint DEFAULT 0 NOT NULL,
	"deal_price" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Menunggu Konfirmasi' NOT NULL,
	"source" text DEFAULT 'publik' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"admin_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bookings_bus_dates_idx" ON "bookings" ("bus_id","start_date","end_date");