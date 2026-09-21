/**
 * Ultra-Detailed Structured Logging Service
 * Provides granular tracing, component tagging, ISO timestamps, 
 * in-memory history ring buffer, and Electron IPC sync.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
}

class LoggerService {
  private history: LogEntry[] = [];
  private maxHistorySize = 1000;
  private isDevelopment = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : true;

  private createEntry(level: LogLevel, tag: string, message: string, data?: any): LogEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      tag: tag.startsWith('[') ? tag : `[${tag}]`,
      message,
      data
    };
  }

  private append(entry: LogEntry) {
    this.history.push(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Console output styling
    const prefix = `[${entry.timestamp.slice(11, 23)}] ${entry.level.padEnd(5)} ${entry.tag}`;
    if (this.isDevelopment || entry.level === 'ERROR' || entry.level === 'WARN') {
      switch (entry.level) {
        case 'DEBUG':
          console.debug(`%c${prefix}`, 'color: #94a3b8; font-weight: 500;', entry.message, entry.data !== undefined ? entry.data : '');
          break;
        case 'INFO':
          console.info(`%c${prefix}`, 'color: #38bdf8; font-weight: 600;', entry.message, entry.data !== undefined ? entry.data : '');
          break;
        case 'WARN':
          console.warn(`%c${prefix}`, 'color: #f59e0b; font-weight: 600;', entry.message, entry.data !== undefined ? entry.data : '');
          break;
        case 'ERROR':
          console.error(`%c${prefix}`, 'color: #ef4444; font-weight: bold;', entry.message, entry.data !== undefined ? entry.data : '');
          break;
      }
    }

    // Forward to Electron main process if available
    if (typeof window !== 'undefined' && (window as any).electronAPI?.log) {
      try {
        (window as any).electronAPI.log(entry);
      } catch (e) {
        // ignore IPC forwarding failure
      }
    }
  }

  public debug(tag: string, message: string, data?: any) {
    this.append(this.createEntry('DEBUG', tag, message, data));
  }

  public info(tag: string, message: string, data?: any) {
    this.append(this.createEntry('INFO', tag, message, data));
  }

  public warn(tag: string, message: string, data?: any) {
    this.append(this.createEntry('WARN', tag, message, data));
  }

  public error(tag: string, message: string, errorOrData?: any) {
    let payload = errorOrData;
    if (errorOrData instanceof Error) {
      payload = {
        name: errorOrData.name,
        message: errorOrData.message,
        stack: errorOrData.stack
      };
    }
    this.append(this.createEntry('ERROR', tag, message, payload));
  }

  public getHistory(): readonly LogEntry[] {
    return this.history;
  }

  public clearHistory() {
    this.history = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.history, null, 2);
  }
}

export const logger = new LoggerService();
