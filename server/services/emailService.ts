import nodemailer from 'nodemailer';
import { storage } from '../storage';
import { logger } from './logger';

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@taskmaster.com',
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || emailData.text.replace(/\n/g, '<br>'),
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendTaskCompletedNotification(taskId: string): Promise<void> {
    try {
      const task = await storage.getTask(taskId);
      if (!task) {
        logger.error(`Task not found: ${taskId}`);
        return;
      }

      const template = await storage.getEmailTemplateByType('task_completed');
      if (!template) {
        logger.error('Task completed email template not found');
        return;
      }

      // Replace template variables
      const subject = template.subject
        .replace('{{task.title}}', task.title)
        .replace('{{task.projectName}}', task.projectName);

      const body = template.body
        .replace('{{task.title}}', task.title)
        .replace('{{task.projectName}}', task.projectName)
        .replace('{{task.completedAt}}', task.completedAt?.toISOString() || new Date().toISOString());

      // Get notification email from environment or use default
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'admin@taskmaster.com';

      // Create notification record
      await storage.createNotification({
        type: 'email',
        recipient: notificationEmail,
        subject,
        message: body,
        taskId,
        status: 'pending',
      });

      // Send email
      const success = await this.sendEmail({
        to: notificationEmail,
        subject,
        text: body,
      });

      // Update notification status
      const notifications = await storage.getNotifications(1);
      if (notifications.length > 0) {
        await storage.updateNotificationStatus(
          notifications[0].id,
          success ? 'sent' : 'failed',
          success ? undefined : 'Failed to send email'
        );
      }

    } catch (error) {
      logger.error('Error sending task completed notification:', error);
    }
  }

  async sendErrorAlert(error: any, source: string): Promise<void> {
    try {
      const template = await storage.getEmailTemplateByType('error_alert');
      if (!template) {
        logger.error('Error alert email template not found');
        return;
      }

      const subject = template.subject
        .replace('{{error.type}}', error.name || 'Unknown Error');

      const body = template.body
        .replace('{{source}}', source)
        .replace('{{error.type}}', error.name || 'Unknown Error')
        .replace('{{error.message}}', error.message || 'No message available')
        .replace('{{error.timestamp}}', new Date().toISOString());

      const adminEmail = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || 'admin@taskmaster.com';

      await storage.createNotification({
        type: 'email',
        recipient: adminEmail,
        subject,
        message: body,
        status: 'pending',
      });

      const success = await this.sendEmail({
        to: adminEmail,
        subject,
        text: body,
      });

      const notifications = await storage.getNotifications(1);
      if (notifications.length > 0) {
        await storage.updateNotificationStatus(
          notifications[0].id,
          success ? 'sent' : 'failed',
          success ? undefined : 'Failed to send error alert'
        );
      }

    } catch (emailError) {
      logger.error('Error sending error alert:', emailError);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email service connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
