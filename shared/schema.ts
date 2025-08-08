import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, cancelled
  priority: text("priority").default("medium"), // low, medium, high, urgent
  projectName: text("project_name").notNull(),
  assignee: text("assignee"),
  sourceSystem: text("source_system").notNull(), // which system sent the webhook
  externalId: text("external_id"), // ID from the source system
  metadata: jsonb("metadata"), // additional data from webhook
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  successRate: integer("success_rate").default(100),
  lastActivity: timestamp("last_activity"),
  totalRequests: integer("total_requests").default(0),
  failedRequests: integer("failed_requests").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookId: varchar("webhook_id").references(() => webhooks.id),
  method: text("method").notNull(),
  payload: jsonb("payload"),
  status: text("status").notNull(), // success, error, warning
  errorMessage: text("error_message"),
  responseTime: integer("response_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(), // task_completed, error_alert, etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // email, webhook, slack, etc.
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, failed
  taskId: varchar("task_id").references(() => tasks.id),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  totalRequests: true,
  failedRequests: true,
  successRate: true,
  lastActivity: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;

export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
