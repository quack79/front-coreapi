// Winston Logging
const winston = require("winston");

const log2c = winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});

module.exports = log2c;


/*
const log2f = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: 'conversations.log',
            level: 'info'
        })
    ]
});
*/
// Winston Logging