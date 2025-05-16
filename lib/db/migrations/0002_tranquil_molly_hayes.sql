CREATE TABLE "payment_plan_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar(20) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"before" text,
	"after" text
);
--> statement-breakpoint
ALTER TABLE "payment_plan_logs" ADD CONSTRAINT "payment_plan_logs_plan_id_payment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_logs" ADD CONSTRAINT "payment_plan_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;