ALTER TABLE "verification_codes" ADD PRIMARY KEY ("email");--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "username" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "last_sent_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "last_sent_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "last_sent_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification_codes" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD COLUMN "ip_send_count" integer DEFAULT 1 NOT NULL;