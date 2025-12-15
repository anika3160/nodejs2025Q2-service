import { Injectable, LogLevel } from '@nestjs/common';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
} from 'fs';
import { dirname, join } from 'path';

const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
const LEVEL_ORDER: Record<LogLevel, number> = LOG_LEVELS.reduce(
  (order, level, index) => {
    order[level] = index;
    return order;
  },
  {} as Record<LogLevel, number>,
);
const COLOR_RESET = '\x1b[0m';
const LEVEL_COLORS: Partial<Record<LogLevel, string>> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  log: '\x1b[34m',
  debug: '\x1b[90m',
  verbose: '\x1b[36m',
};
const LEVEL_ALIAS: Record<string, LogLevel> = {};
const LOG_ROOT = join(process.cwd(), 'logs');
const DEFAULT_LOG_FILE_PATH = join(LOG_ROOT, 'app.log');
const DEFAULT_ERROR_LOG_FILE_PATH = join(LOG_ROOT, 'error.log');
const DEFAULT_MAX_SIZE_BYTES = 1024 * 1024; // 1 MB

type LoggerConfig = {
  threshold: number;
  logFilePath: string;
  errorLogFilePath: string;
  maxFileSizeBytes: number;
};

@Injectable()
export class LoggingService {
  private readonly config: LoggerConfig = this.loadConfig();

  debug(message: string, meta?: Record<string, unknown>) {
    this.write('debug', message, meta);
  }

  log(message: string, meta?: Record<string, unknown>) {
    this.write('log', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.write('error', message, meta);
  }

  verbose(message: string, meta?: Record<string, unknown>) {
    this.write('verbose', message, meta);
  }

  private write(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    if (!this.shouldLog(level)) {
      return;
    }

    const { logFilePath, errorLogFilePath } = this.config;
    const timestamp = new Date().toISOString();
    const levelLabel = level.toUpperCase().padEnd(7);
    const consoleMeta = this.serializeMeta(meta);
    const fileMeta = this.serializeMeta(meta);
    const consoleLine = `${timestamp} ${this.colorize(level, `[${levelLabel}]`)} ${message}${consoleMeta}\n`;
    const fileLine = `${timestamp} [${levelLabel}] ${message}${fileMeta}\n`;

    process.stdout.write(consoleLine);
    this.writeToFile(fileLine, logFilePath);
    if (level === 'error') {
      this.writeToFile(fileLine, errorLogFilePath);
    }
  }

  private writeToFile(line: string, filePath: string) {
    try {
      this.prepareLogDirectory(filePath);
      this.rotateIfNeeded(filePath);
      appendFileSync(filePath, line, 'utf-8');
    } catch {}
  }

  private prepareLogDirectory(filePath: string) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private rotateIfNeeded(filePath: string) {
    try {
      const { size } = statSync(filePath);
      if (size < this.config.maxFileSizeBytes) {
        return;
      }
      renameSync(filePath, `${filePath}.${Date.now()}`);
    } catch {}
  }

  private resolveLevel(levelFromEnv?: string): LogLevel {
    const normalized = levelFromEnv?.trim();
    if (!normalized) return 'log';

    const numeric = Number(normalized);
    if (
      Number.isInteger(numeric) &&
      numeric >= 0 &&
      numeric < LOG_LEVELS.length
    ) {
      return LOG_LEVELS[numeric];
    }

    const lower = normalized.toLowerCase();
    if (LEVEL_ALIAS[lower]) {
      return LEVEL_ALIAS[lower];
    }

    return this.isLogLevel(lower) ? lower : 'log';
  }

  private getPositiveNumber(
    value: string | undefined,
    fallback: number,
    multiplier = 1,
  ) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0
      ? number * multiplier
      : fallback;
  }

  private serializeMeta(meta?: Record<string, unknown>): string {
    if (!meta || Object.keys(meta).length === 0) {
      return '';
    }
    return ` ${JSON.stringify(meta)}`;
  }

  private colorize(level: LogLevel, text: string) {
    const color = LEVEL_COLORS[level];
    return color ? `${color}${text}${COLOR_RESET}` : text;
  }

  private loadConfig(): LoggerConfig {
    return {
      threshold: LEVEL_ORDER[this.resolveLevel(process.env.LOG_LEVEL)],
      logFilePath: process.env.LOG_FILE_PATH || DEFAULT_LOG_FILE_PATH,
      errorLogFilePath:
        process.env.LOG_ERROR_FILE_PATH || DEFAULT_ERROR_LOG_FILE_PATH,
      maxFileSizeBytes: this.getPositiveNumber(
        process.env.LOG_MAX_FILE_SIZE_KB,
        DEFAULT_MAX_SIZE_BYTES,
        1024,
      ),
    };
  }

  private shouldLog(level: LogLevel) {
    return LEVEL_ORDER[level] <= this.config.threshold;
  }

  private isLogLevel(value: string): value is LogLevel {
    return LOG_LEVELS.includes(value as LogLevel);
  }
}
