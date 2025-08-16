import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Required environment variables
const requiredEnv = ["GOOGLE_SHEET_ID", "GOOGLE_CREDENTIALS_PATH"];

// Validate required environment variables
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    throw new Error(
        `Missing required environment variable(s): ${missingEnv.join(", ")}`
    );
}

// Config constants
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Sheet1";
const RANGE = `${SHEET_NAME}!A:D`;
const GOOGLE_CREDENTIALS_PATH = path.resolve(
    process.env.GOOGLE_CREDENTIALS_PATH
);
const TZ = process.env.TZ || "Asia/Manila";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 1 * * *";
const LOG_FILE = path.resolve("logs.txt");
const TRACK_FILE = path.resolve("last-run.txt");

// Ensure files exist
[LOG_FILE, TRACK_FILE].forEach((file) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "", "utf8");
    }
});

// Freeze the object to make it immutable
const config = Object.freeze({
    SHEET_ID,
    SHEET_NAME,
    RANGE,
    GOOGLE_CREDENTIALS_PATH,
    TZ,
    CRON_SCHEDULE,
    LOG_FILE,
    TRACK_FILE,
});

// Default export
export default config;
