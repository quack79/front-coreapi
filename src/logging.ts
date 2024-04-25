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

    private static logFormatTemplate(i: { level: string, message: string, [key: string]: any }): string {
        return `${i.level} [${i.label}] ${i.message}`;
    }

    private static readonly consoleTransport = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.cli(),
            winston.format.printf(Logger.logFormatTemplate),
        ),
    });

    private static readonly fileTransport = new winston.transports.File({
        format: winston.format.combine(
            winston.format.printf(Logger.logFormatTemplate),
        ),
        filename: resolve("./conversations.log"),
        level: "info"
    });
}
// Winston Logging
