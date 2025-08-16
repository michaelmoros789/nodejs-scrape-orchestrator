import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "logs.txt");

const LEVELS = {
    info: "INFO",
    warn: "WARN",
    error: "ERROR",
    debug: "DEBUG",
};

function formatTimestamp(date = new Date()) {
    return date.toISOString().replace("T", " ").split(".")[0];
}

function writeLog(level, message, meta = null) {
    const timestamp = formatTimestamp();
    const logLine =
        `[${timestamp}] [${LEVELS[level]}] ${message}` +
        (meta ? ` | ${JSON.stringify(meta)}` : "");

    // Console output (with colors)
    switch (level) {
        case "info":
            console.log(`\x1b[32m${logLine}\x1b[0m`);
            break;
        case "warn":
            console.warn(`\x1b[33m${logLine}\x1b[0m`);
            break;
        case "error":
            console.error(`\x1b[31m${logLine}\x1b[0m`);
            break;
        case "debug":
            console.debug(`\x1b[36m${logLine}\x1b[0m`);
            break;
    }

    // Only persist WARN + ERROR to logs.txt
    if (level === "warn" || level === "error") {
        fs.appendFileSync(LOG_FILE, logLine + "\n" + "\n", "utf8");
    }
}

export const logger = {
    info: (msg, meta) => writeLog("info", msg, meta),
    warn: (msg, meta) => writeLog("warn", msg, meta),
    error: (msg, meta) => writeLog("error", msg, meta),
    debug: (msg, meta) => writeLog("debug", msg, meta),
};
