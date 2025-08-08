import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/emailService";
import { syncService } from "./services/syncService";
import { logger } from "./services/logger";
import { insertTaskSchema, insertWebhookSchema, insertEmailTemplateSchema } from "@shared/schema";
import { z } from "zod";

// Webhook payload schema for task updates
const webhookTaskPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  projectName: z.string(),
  assignee: z.string().optional(),
  sourceSystem: z.string(),
  externalId: z.string().optional(),
  metadata: z.any().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Webhook endpoints for receiving task updates
  app.post("/api/webhook/tasks", async (req, res) => {
    const startTime = Date.now();
    let webhookId: string | null = null;
    
    try {
      logger.info("Received webhook task update", { payload: req.body });
      
      // Find or create webhook record
      const sourceSystem = req.body.sourceSystem || 'unknown';
      const endpoint = `/api/webhook/tasks`;
      
      let webhook = await storage.getWebhookByEndpoint(endpoint);
      if (!webhook) {
        webhook = await storage.createWebhook({
          name: `${sourceSystem} Tasks`,
          endpoint,
          isActive: true,
        });
      }
      
      webhookId = webhook.id;
      
      // Validate payload
      const validatedPayload = webhookTaskPayloadSchema.parse(req.body);
      
      // Check if task exists (for updates)
      let task;
      if (validatedPayload.externalId) {
        const existingTasks = await storage.getAllTasks();
        task = existingTasks.find(t => 
          t.externalId === validatedPayload.externalId && 
          t.sourceSystem === validatedPayload.sourceSystem
        );
      }
      
      if (task) {
        // Update existing task
        const oldStatus = task.status;
        task = await storage.updateTask(task.id, {
          title: validatedPayload.title,
          description: validatedPayload.description,
          status: validatedPayload.status,
          priority: validatedPayload.priority || 'medium',
          projectName: validatedPayload.projectName,
          assignee: validatedPayload.assignee,
          metadata: validatedPayload.metadata,
        });
        
        // Send notification if task was completed
        if (oldStatus !== 'completed' && validatedPayload.status === 'completed' && task) {
          await emailService.sendTaskCompletedNotification(task.id);
        }
        
        logger.info(`Task updated: ${task?.id}`);
      } else {
        // Create new task
        task = await storage.createTask({
          title: validatedPayload.title,
          description: validatedPayload.description,
          status: validatedPayload.status,
          priority: validatedPayload.priority || 'medium',
          projectName: validatedPayload.projectName,
          assignee: validatedPayload.assignee,
          sourceSystem: validatedPayload.sourceSystem,
          externalId: validatedPayload.externalId,
          metadata: validatedPayload.metadata,
        });
        
        // Send notification if task was created as completed
        if (validatedPayload.status === 'completed') {
          await emailService.sendTaskCompletedNotification(task.id);
        }
        
        logger.info(`Task created: ${task.id}`);
      }
      
      // Sync to external service asynchronously
      if (task) {
        syncService.syncTaskUpdate(task.id).catch(error => {
          logger.error('Async sync failed:', error);
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      // Log successful webhook processing
      await storage.createWebhookLog({
        webhookId,
        method: req.method,
        payload: req.body,
        status: 'success',
        responseTime,
      });
      
      // Update webhook stats
      await storage.updateWebhookStats(webhookId, true, responseTime);
      
      res.status(200).json({ 
        success: true, 
        taskId: task!.id,
        action: task ? 'updated' : 'created'
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Webhook processing failed:', error);
      
      // Log failed webhook processing
      if (webhookId) {
        await storage.createWebhookLog({
          webhookId,
          method: req.method,
          payload: req.body,
          status: 'error',
          errorMessage,
          responseTime,
        });
        
        await storage.updateWebhookStats(webhookId, false, responseTime);
      }
      
      // Send error alert
      await emailService.sendErrorAlert(error, 'Webhook Task Processing');
      
      res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
  });

  // Dashboard API endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      logger.error('Failed to get dashboard stats:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const { status, project, limit } = req.query;
      let tasks;
      
      if (status) {
        tasks = await storage.getTasksByStatus(status as string);
      } else if (project) {
        tasks = await storage.getTasksByProject(project as string);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      if (limit) {
        tasks = tasks.slice(0, parseInt(limit as string));
      }
      
      res.json(tasks);
    } catch (error) {
      logger.error('Failed to get tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  app.get("/api/tasks/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tasks = await storage.getRecentTasks(limit);
      res.json(tasks);
    } catch (error) {
      logger.error('Failed to get recent tasks:', error);
      res.status(500).json({ error: 'Failed to get recent tasks' });
    }
  });

  app.get("/api/webhooks", async (req, res) => {
    try {
      const webhooks = await storage.getAllWebhooks();
      res.json(webhooks);
    } catch (error) {
      logger.error('Failed to get webhooks:', error);
      res.status(500).json({ error: 'Failed to get webhooks' });
    }
  });

  app.post("/api/webhooks", async (req, res) => {
    try {
      const validatedData = insertWebhookSchema.parse(req.body);
      const webhook = await storage.createWebhook(validatedData);
      res.status(201).json(webhook);
    } catch (error) {
      logger.error('Failed to create webhook:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create webhook' });
      }
    }
  });

  app.put("/api/webhooks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const webhook = await storage.updateWebhook(id, updates);
      
      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }
      
      res.json(webhook);
    } catch (error) {
      logger.error('Failed to update webhook:', error);
      res.status(500).json({ error: 'Failed to update webhook' });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWebhook(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Webhook not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      logger.error('Failed to delete webhook:', error);
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const { webhookId, limit } = req.query;
      const logs = await storage.getWebhookLogs(
        webhookId as string, 
        parseInt(limit as string) || 50
      );
      res.json(logs);
    } catch (error) {
      logger.error('Failed to get logs:', error);
      res.status(500).json({ error: 'Failed to get logs' });
    }
  });

  app.get("/api/logs/errors", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const errorLogs = await storage.getErrorLogs(limit);
      res.json(errorLogs);
    } catch (error) {
      logger.error('Failed to get error logs:', error);
      res.status(500).json({ error: 'Failed to get error logs' });
    }
  });

  app.get("/api/notifications", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getNotifications(limit);
      res.json(notifications);
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  });

  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      logger.error('Failed to get email templates:', error);
      res.status(500).json({ error: 'Failed to get email templates' });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      logger.error('Failed to create email template:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create email template' });
      }
    }
  });

  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const template = await storage.updateEmailTemplate(id, updates);
      
      if (!template) {
        return res.status(404).json({ error: 'Email template not found' });
      }
      
      res.json(template);
    } catch (error) {
      logger.error('Failed to update email template:', error);
      res.status(500).json({ error: 'Failed to update email template' });
    }
  });

  // Health check endpoints
  app.get("/api/health", async (req, res) => {
    try {
      const emailHealthy = await emailService.testConnection();
      const syncStatus = await syncService.getServiceStatus();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'healthy', message: 'In-memory storage operational' },
          email: { 
            status: emailHealthy ? 'healthy' : 'error', 
            message: emailHealthy ? 'SMTP connection successful' : 'SMTP connection failed' 
          },
          sync: { 
            status: syncStatus.isHealthy ? 'healthy' : 'warning', 
            message: syncStatus.isHealthy ? 'External sync service responsive' : 'External sync service issues',
            responseTime: syncStatus.responseTime,
            lastError: syncStatus.lastError
          },
        },
      };
      
      const hasErrors = Object.values(health.services).some(service => service.status === 'error');
      if (hasErrors) {
        health.status = 'degraded';
      }
      
      res.json(health);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test webhook endpoint for development
  app.post("/api/test/webhook", async (req, res) => {
    try {
      const testPayload = {
        title: "Test Task",
        description: "This is a test task created via webhook",
        status: "completed",
        priority: "medium",
        projectName: "Test Project",
        assignee: "Test User",
        sourceSystem: "test-system",
        externalId: `test-${Date.now()}`,
        metadata: { test: true, timestamp: new Date().toISOString() }
      };
      
      // Send to our own webhook endpoint
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/webhook/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });
      
      const result = await response.json();
      res.json({ success: true, webhookResponse: result });
    } catch (error) {
      logger.error('Test webhook failed:', error);
      res.status(500).json({ error: 'Test webhook failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
