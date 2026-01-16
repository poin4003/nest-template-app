import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import { AppConfigService } from '@/config/settings/app-config.service';

@Injectable()
export class MyLoggerService implements LoggerService {
	private logger: winston.Logger;

	constructor(private settings: AppConfigService) {
		const logDir = this.settings.LOG_DIR;
		const maxSize = this.settings.LOG_MAX_SIZE;
		const maxFiles = this.settings.LOG_MAX_FILES;

		const formatPrint = winston.format.printf(
			({ level, message, context, requestId, timestamp, metadata }) => {
				return `${timestamp}::${level}::${context || 'Application'}::${requestId || 'N/A'}::${message}::${
					metadata ? JSON.stringify(metadata) : ''
				}`;
			},
		);

		this.logger = winston.createLogger({
			format: winston.format.combine(
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				formatPrint,
			),
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple(),
					),
				}),
				new winston.transports.DailyRotateFile({
					dirname: path.join(process.cwd(), logDir),
					filename: 'application-%DATE%.info.log',
					datePattern: 'YYYY-MM-DD',
					maxSize: maxSize,
					maxFiles: maxFiles,
					level: 'info',
				}),
				new winston.transports.DailyRotateFile({
					dirname: path.join(process.cwd(), logDir),
					filename: 'application-%DATE%.error.log',
					datePattern: 'YYYY-MM-DD',
					maxSize: maxSize,
					maxFiles: maxFiles,
					level: 'error',
				}),
			],
		});
	}

	log(message: string, context?: string) {
		this.logger.info(message, { context });
	}

	error(message: string, trace?: string, context?: string) {
		this.logger.error(message, { context, trace });
	}

	warn(message: string, context?: string) {
		this.logger.warn(message, { context });
	}

	customLog(
		message: string,
		params: { context?: string; requestId?: string; metadata?: any },
	) {
		this.logger.info(message, params);
	}
}
