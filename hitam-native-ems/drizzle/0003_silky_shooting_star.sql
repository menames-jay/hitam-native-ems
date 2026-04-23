CREATE TYPE "public"."event_category" AS ENUM('CLUB', 'TECHNICAL', 'INSTITUTE');--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "event_approvals" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_approvals" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "category" "event_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;