import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  orgId: uuid("org_id"),
  roles: text("roles").array().notNull().default(sql`ARRAY['learner']::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orgs = pgTable("orgs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerUid: uuid("owner_uid").notNull(),
  planTier: text("plan_tier").notNull().default("starter"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  passScore: integer("pass_score").notNull().default(80),
  estMins: integer("est_mins"),
  createdBy: uuid("created_by").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").notNull(),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  contentHtml: text("content_html").notNull(),
  learningObjectives: text("learning_objectives").array().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: uuid("module_id").notNull(),
  index: integer("index").notNull(),
  stemHtml: text("stem_html").notNull(),
  options: text("options").array().notNull(),
  correctIndex: integer("correct_index").notNull(),
  rationaleHtml: text("rationale_html").notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  courseId: uuid("course_id").notNull(),
  userId: uuid("user_id").notNull(),
  status: text("status").notNull().default("in_progress"),
  progress: jsonb("progress"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  courseId: uuid("course_id").notNull(),
  moduleId: uuid("module_id").notNull(),
  questionId: uuid("question_id").notNull(),
  selectedIndex: integer("selected_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  courseId: uuid("course_id").notNull(),
  name: text("name").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
  certificateUrl: text("certificate_url"),
});

export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  source: text("source").notNull(),
  content: text("content").notNull(),
  processed: boolean("processed").notNull().default(false),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrgSchema = createInsertSchema(orgs).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  startedAt: true,
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  awardedAt: true,
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrg = z.infer<typeof insertOrgSchema>;
export type Org = typeof orgs.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attempts.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

// Additional types for API responses
export interface CourseWithModules {
  course: Course;
  modules: ModuleWithQuestions[];
}

export interface ModuleWithQuestions extends Module {
  questions: Question[];
}
