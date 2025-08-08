import { 
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask,
  type Webhook,
  type InsertWebhook,
  type WebhookLog,
  type InsertWebhookLog,
  type EmailTemplate,
  type InsertEmailTemplate,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByProject(projectName: string): Promise<Task[]>;
  getRecentTasks(limit?: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Webhooks
  getWebhook(id: string): Promise<Webhook | undefined>;
  getWebhookByEndpoint(endpoint: string): Promise<Webhook | undefined>;
  getAllWebhooks(): Promise<Webhook[]>;
  getActiveWebhooks(): Promise<Webhook[]>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, updates: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  updateWebhookStats(id: string, success: boolean, responseTime: number): Promise<void>;
  deleteWebhook(id: string): Promise<boolean>;

  // Webhook Logs
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(webhookId?: string, limit?: number): Promise<WebhookLog[]>;
  getErrorLogs(limit?: number): Promise<WebhookLog[]>;

  // Email Templates
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined>;
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(limit?: number): Promise<Notification[]>;
  updateNotificationStatus(id: string, status: string, errorMessage?: string): Promise<void>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    activeWebhooks: number;
    tasksProcessed: number;
    failedRequests: number;
    avgResponseTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private webhooks: Map<string, Webhook>;
  private webhookLogs: Map<string, WebhookLog>;
  private emailTemplates: Map<string, EmailTemplate>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.webhooks = new Map();
    this.webhookLogs = new Map();
    this.emailTemplates = new Map();
    this.notifications = new Map();

    // Initialize with default email templates
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        id: randomUUID(),
        name: "Task Completed",
        subject: "Task '{{task.title}}' has been completed",
        body: "The task '{{task.title}}' in project '{{task.projectName}}' has been marked as completed.\n\nTask Details:\n- Title: {{task.title}}\n- Project: {{task.projectName}}\n- Completed At: {{task.completedAt}}\n\nBest regards,\nTaskSync Team",
        type: "task_completed",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Error Alert",
        subject: "Webhook Error: {{error.type}}",
        body: "An error occurred while processing webhook data from {{source}}.\n\nError Details:\n- Type: {{error.type}}\n- Message: {{error.message}}\n- Timestamp: {{error.timestamp}}\n\nPlease check the system logs for more information.\n\nTaskSync Team",
        type: "error_alert",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    defaultTemplates.forEach(template => {
      this.emailTemplates.set(template.id, template);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.updatedAt || b.createdAt!).getTime() - new Date(a.updatedAt || a.createdAt!).getTime()
    );
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getTasksByProject(projectName: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectName === projectName);
  }

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.slice(0, limit);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: now, 
      updatedAt: now,
      completedAt: insertTask.status === 'completed' ? now : null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = { 
      ...task, 
      ...updates, 
      updatedAt: new Date(),
      completedAt: updates.status === 'completed' ? new Date() : task.completedAt
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Webhooks
  async getWebhook(id: string): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }

  async getWebhookByEndpoint(endpoint: string): Promise<Webhook | undefined> {
    return Array.from(this.webhooks.values()).find(webhook => webhook.endpoint === endpoint);
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values());
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(webhook => webhook.isActive);
  }

  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const id = randomUUID();
    const webhook: Webhook = { 
      ...insertWebhook, 
      id, 
      createdAt: new Date(),
      totalRequests: 0,
      failedRequests: 0,
      successRate: 100,
      lastActivity: null
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async updateWebhook(id: string, updates: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;

    const updatedWebhook: Webhook = { ...webhook, ...updates };
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }

  async updateWebhookStats(id: string, success: boolean, responseTime: number): Promise<void> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return;

    const totalRequests = (webhook.totalRequests || 0) + 1;
    const failedRequests = webhook.failedRequests || 0 + (success ? 0 : 1);
    const successRate = Math.round(((totalRequests - failedRequests) / totalRequests) * 100);

    const updatedWebhook: Webhook = {
      ...webhook,
      totalRequests,
      failedRequests,
      successRate,
      lastActivity: new Date()
    };

    this.webhooks.set(id, updatedWebhook);
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }

  // Webhook Logs
  async createWebhookLog(insertLog: InsertWebhookLog): Promise<WebhookLog> {
    const id = randomUUID();
    const log: WebhookLog = { ...insertLog, id, createdAt: new Date() };
    this.webhookLogs.set(id, log);
    return log;
  }

  async getWebhookLogs(webhookId?: string, limit: number = 50): Promise<WebhookLog[]> {
    let logs = Array.from(this.webhookLogs.values());
    
    if (webhookId) {
      logs = logs.filter(log => log.webhookId === webhookId);
    }
    
    return logs
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getErrorLogs(limit: number = 20): Promise<WebhookLog[]> {
    return Array.from(this.webhookLogs.values())
      .filter(log => log.status === 'error' || log.status === 'warning')
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Email Templates
  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    return Array.from(this.emailTemplates.values()).find(template => 
      template.type === type && template.isActive
    );
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = randomUUID();
    const now = new Date();
    const template: EmailTemplate = { 
      ...insertTemplate, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.emailTemplates.set(id, template);
    return template;
  }

  async updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = this.emailTemplates.get(id);
    if (!template) return undefined;

    const updatedTemplate: EmailTemplate = { 
      ...template, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.emailTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date(),
      sentAt: null
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(limit: number = 50): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async updateNotificationStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const updatedNotification: Notification = {
      ...notification,
      status,
      errorMessage,
      sentAt: status === 'sent' ? new Date() : notification.sentAt
    };

    this.notifications.set(id, updatedNotification);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    activeWebhooks: number;
    tasksProcessed: number;
    failedRequests: number;
    avgResponseTime: number;
  }> {
    const webhooks = await this.getActiveWebhooks();
    const allLogs = await this.getWebhookLogs();
    const tasks = await this.getAllTasks();

    const failedRequests = allLogs.filter(log => log.status === 'error').length;
    const responseTimes = allLogs
      .filter(log => log.responseTime !== null)
      .map(log => log.responseTime || 0);
    
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;

    return {
      activeWebhooks: webhooks.length,
      tasksProcessed: tasks.length,
      failedRequests,
      avgResponseTime
    };
  }
}

export const storage = new MemStorage();
