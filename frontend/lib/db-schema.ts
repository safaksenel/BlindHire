/**
 * ==========================================
 * DATABASE TYPES & SCHEMAS (AgenticHR.ai)
 * ==========================================
 */

export type Role = "SUPER_ADMIN" | "HR" | "CANDIDATE";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  companyId?: string | null; // Belongs to a company if role is HR
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  companyId: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  candidateId: string;
  jobPostingId: string;
  cvUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * PRISMA SCHEMA DEFINITIONS (Reference)
 * ==========================================
 *
 * enum Role {
 *   SUPER_ADMIN
 *   HR
 *   CANDIDATE
 * }
 *
 * model Company {
 *   id          String       @id @default(uuid())
 *   name        String       @unique
 *   logoUrl     String?
 *   users       User[]       @relation("CompanyUsers")
 *   jobPostings JobPosting[] @relation("CompanyJobs")
 *   createdAt   DateTime     @default(now())
 *   updatedAt   DateTime     @updatedAt
 * }
 *
 * model User {
 *   id           String        @id @default(uuid())
 *   email        String        @unique
 *   passwordHash String
 *   fullName     String
 *   role         Role          @default(CANDIDATE)
 *   companyId    String?
 *   company      Company?      @relation("CompanyUsers", fields: [companyId], references: [id], onDelete: SetNull)
 *   applications Application[] @relation("CandidateApplications")
 *   createdAt    DateTime      @default(now())
 *   updatedAt    DateTime      @updatedAt
 * }
 *
 * model JobPosting {
 *   id           String        @id @default(uuid())
 *   title        String
 *   description  String
 *   companyId    String
 *   company      Company       @relation("CompanyJobs", fields: [companyId], references: [id], onDelete: Cascade)
 *   applications Application[] @relation("JobApplications")
 *   status       String        @default("ACTIVE")
 *   createdAt    DateTime      @default(now())
 *   updatedAt    DateTime      @updatedAt
 * }
 *
 * model Application {
 *   id           String     @id @default(uuid())
 *   candidateId  String
 *   candidate    User       @relation("CandidateApplications", fields: [candidateId], references: [id], onDelete: Cascade)
 *   jobPostingId String
 *   jobPosting   JobPosting @relation("JobApplications", fields: [jobPostingId], references: [id], onDelete: Cascade)
 *   cvUrl        String
 *   status       String     @default("PENDING")
 *   createdAt    DateTime   @default(now())
 *   updatedAt    DateTime   @updatedAt
 * }
 *
 * model HRSettings {
 *   id                    String   @id @default(uuid())
 *   companyId             String   @unique
 *   company               Company  @relation("CompanySettings", fields: [companyId], references: [id], onDelete: Cascade)
 *   autoInviteThreshold   Int      @default(80)
 *   manualReviewThreshold Int      @default(60)
 *   autoRejectThreshold   Int      @default(59)
 *   createdAt             DateTime @default(now())
 *   updatedAt             DateTime @updatedAt
 * }
 */

/**
 * ==========================================
 * DRIZZLE SCHEMA DEFINITIONS (Reference)
 * ==========================================
 *
 * import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
 *
 * export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "HR", "CANDIDATE"]);
 *
 * export const companies = pgTable("companies", {
 *   id: text("id").primaryKey(),
 *   name: text("name").notNull().unique(),
 *   logoUrl: text("logo_url"),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 * });
 *
 * export const users = pgTable("users", {
 *   id: text("id").primaryKey(),
 *   email: text("email").notNull().unique(),
 *   passwordHash: text("password_hash").notNull(),
 *   fullName: text("full_name").notNull(),
 *   role: roleEnum("role").default("CANDIDATE").notNull(),
 *   companyId: text("company_id").references(() => companies.id, { onDelete: "set null" }),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 * });
 *
 * export const jobPostings = pgTable("job_postings", {
 *   id: text("id").primaryKey(),
 *   title: text("title").notNull(),
 *   description: text("description").notNull(),
 *   companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
 *   status: text("status").default("ACTIVE").notNull(),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 * });
 *
 * export const applications = pgTable("applications", {
 *   id: text("id").primaryKey(),
 *   candidateId: text("candidate_id").notNull().references(() => users.id, { onDelete: "cascade" }),
 *   jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
 *   cvUrl: text("cv_url").notNull(),
 *   status: text("status").default("PENDING").notNull(),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 * });
 *
 * export const hrSettings = pgTable("hr_settings", {
 *   id: text("id").primaryKey(),
 *   companyId: text("company_id").notNull().unique().references(() => companies.id, { onDelete: "cascade" }),
 *   autoInviteThreshold: integer("auto_invite_threshold").default(80).notNull(),
 *   manualReviewThreshold: integer("manual_review_threshold").default(60).notNull(),
 *   autoRejectThreshold: integer("auto_reject_threshold").default(59).notNull(),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 * });
 */
