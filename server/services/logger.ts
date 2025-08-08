import fs from 'fs';
import path from 'path';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;
  private maxLogFiles: number;
  private maxLogSizeBytes: number;

  constructor() {
    this.logDir = process.env.LOG_DIR || './logs';
    this.maxLogFiles = parseInt(process.env.MAX_LOG_FILES || '10');
    this.maxLogSizeBytes = parseInt(process.env.MAX_LOG_SIZE_BYTES || '10485760'); // 10MB

    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase() as LogLevel,
      message,
      ...(data && { data }),
    };
    
    return JSON.stringify(logEntry);
  }

  private writeToFile(level: LogLevel, formattedMessage: string): void {
    try {
      const filename = `${level}-${new Date().toISOString().split('T')[0]}.log`;
      const filepath = path.join(this.logDir, filename);
      
      fs.appendFileSync(filepath, formattedMessage + '\n');
      this.rotateLogsIfNeeded(filepath);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogsIfNeeded(filepath: string): void {
    try {
      const stats = fs.statSync(filepath);
      if (stats.size > this.maxLogSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFilepath = filepath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(filepath, rotatedFilepath);
        
        // Clean up old log files
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          time: fs.statSync(path.join(this.logDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > this.maxLogFiles) {
        const filesToDelete = files.slice(this.maxLogFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  info(message: string, data?: any): void {
    const formatted = this.formatMessage('info', message, data);
    console.log(formatted);
    this.writeToFile('info', formatted);
  }

  warn(message: string, data?: any): void {
    const formatted = this.formatMessage('warn', message, data);
    console.warn(formatted);
    this.writeToFile('warn', formatted);
  }

  error(message: string, data?: any): void {
    const formatted = this.formatMessage('error', message, data);
    console.error(formatted);
    this.writeToFile('error', formatted);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, data);
      console.debug(formatted);
      this.writeToFile('debug', formatted);
    }
  }

  getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    try {
      const logs: LogEntry[] = [];
      const files = fs.readdirSync(this.logDir)
        .filter(file => {
          if (level) {
            return file.startsWith(level) && file.endsWith('.log');
          }
          return file.endsWith('.log');
        })
        .sort()
        .reverse();

      for (const file of files) {
        const filepath = path.join(this.logDir, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const lines = content.trim().split('\n').reverse();
        
        for (const line of lines) {
          if (logs.length >= limit) break;
          try {
            const logEntry = JSON.parse(line);
            logs.push(logEntry);
          } catch (parseError) {
            // Skip invalid JSON lines
          }
        }
        
        if (logs.length >= limit) break;
      }

      return logs.slice(0, limit);
    } catch (error) {
      console.error('Failed to read log files:', error);
      return [];
    }
  }
}

export const logger = new Logger();
