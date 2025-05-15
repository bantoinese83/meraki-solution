ALTER TABLE "invoices" ADD COLUMN "stripe_payment_link" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp;