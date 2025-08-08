import axios from 'axios';
import { storage } from '../storage';
import { logger } from './logger';
import { Task } from '@shared/schema';

interface ExternalSyncConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

class SyncService {
  private config: ExternalSyncConfig;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.config = {
      baseUrl: process.env.EXTERNAL_SYNC_URL || 'https://api.external-service.com',
      apiKey: process.env.EXTERNAL_SYNC_API_KEY || 'default-api-key',
      timeout: parseInt(process.env.SYNC_TIMEOUT || '5000'),
      retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3'),
    };
  }

  async syncTaskToExternalService(task: Task): Promise<boolean> {
    let attempt = 1;
    
    while (attempt <= this.config.retryAttempts) {
      try {
        logger.info(`Syncing task ${task.id} to external service (attempt ${attempt})`);
        
        const response = await axios.post(
          `${this.config.baseUrl}/tasks`,
          {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            projectName: task.projectName,
            assignee: task.assignee,
            externalId: task.externalId,
            metadata: task.metadata,
            updatedAt: task.updatedAt,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: this.config.timeout,
          }
        );

        if (response.status >= 200 && response.status < 300) {
          logger.info(`Task ${task.id} successfully synced to external service`);
          return true;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      } catch (error) {
        logger.error(`Sync attempt ${attempt} failed for task ${task.id}:`, error);
        
        if (attempt === this.config.retryAttempts) {
          logger.error(`All sync attempts failed for task ${task.id}`);
          return false;
        }

        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
        attempt++;
      }
    }

    return false;
  }

  async syncTaskUpdate(taskId: string): Promise<void> {
    try {
      const task = await storage.getTask(taskId);
      if (!task) {
        logger.error(`Task not found for sync: ${taskId}`);
        return;
      }

      const success = await this.syncTaskToExternalService(task);
      
      if (!success) {
        // Log the sync failure for monitoring
        await storage.createWebhookLog({
          webhookId: null,
          method: 'SYNC',
          payload: { taskId, action: 'sync_task' },
          status: 'error',
          errorMessage: 'Failed to sync task to external service after all retry attempts',
          responseTime: null,
        });
      }
    } catch (error) {
      logger.error(`Error in syncTaskUpdate for task ${taskId}:`, error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        timeout: this.config.timeout,
      });

      return response.status >= 200 && response.status < 300;
    } catch (error) {
      logger.error('External sync service connection test failed:', error);
      return false;
    }
  }

  async getServiceStatus(): Promise<{
    isHealthy: boolean;
    responseTime: number | null;
    lastError?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await this.testConnection();
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy,
        responseTime,
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: null,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const syncService = new SyncService();
