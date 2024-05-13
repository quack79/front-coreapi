// Winston Logging
import winston = require("winston");
import { resolve } from "path";

export class Logger {
    public static getLogger(label: string): winston.Logger {
        if (!winston.loggers.has(label)) {
            winston.loggers.add(label, {
                transports: [Logger.consoleTransport, Logger.fileTransport],
                format: winston.format.label({ label }),
            });
        }
        return winston.loggers.get(label);
    }

    private static logConsoleFormat(i: { level: string, message: string, [key: string]: any }): string {
        return `${i.level} [${i.label}] ${i.message}`;
    }

    private static logFileFormat(i: { level: string, message: string, [key: string]: any }): string {
        return `${i.level} [${i.label}] ${i.timestamp} ${i.message}`;
    }

    private static readonly consoleTransport = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.cli(),
            winston.format.printf(Logger.logConsoleFormat),
        ),
    });

    private static readonly fileTransport = new winston.transports.File({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(Logger.logFileFormat),
        ),
        filename: resolve("./debug.log"),
        level: "debug"
    });
}
// Winston Logging
