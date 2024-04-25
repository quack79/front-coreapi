// Winston Logging
const winston = require("winston");

const log2c = winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});

const log2f = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: 'conversations.log',
            level: 'info'
        })
    ]
});

module.exports = log2f, log2c;

// Winston Logging