// Winston Logging
const winston = require("winston");

const log2f = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: 'conversations.log',
            level: 'info'
        })
    ]
});

const log2c = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});

module.exports = log2f, log2c;
// Winston Logging