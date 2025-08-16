import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";
import { logger } from "./logger.js";
import config from "./config.js";
const { TRACK_FILE, GOOGLE_CREDENTIALS_PATH, SHEET_ID, SHEET_NAME, TZ } =
    config;

const RANGE = `${SHEET_NAME}!A:D`;

async function appendToGoogleSheet(rows) {
    logger.info("🔐 Authenticating with Google Sheets...");
    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_CREDENTIALS_PATH,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    logger.info(`📤 Appending ${rows.length} rows...`);
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: RANGE,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: rows,
        },
    });

    logger.info("✅ Appended successfully to Google Sheet.");
}

function getToday(date = new Date(), tz = TZ) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
}

function hasRunToday(brand, { today = getToday() } = {}) {
    if (!fs.existsSync(TRACK_FILE)) return false;

    const lines = fs
        .readFileSync(TRACK_FILE, "utf8")
        .split("\n")
        .filter(Boolean);

    for (const line of lines) {
        const [label, date] = line.split(":").map((s) => s.trim());
        if (label === brand && date === today) return true;
    }

    return false;
}

function markAsRunToday(brand) {
    const today = getToday();

    const map = new Map();

    if (fs.existsSync(TRACK_FILE)) {
        const lines = fs
            .readFileSync(TRACK_FILE, "utf8")
            .split("\n")
            .filter(Boolean);
        for (const line of lines) {
            const [label, date] = line.split(":").map((s) => s.trim());
            map.set(label, date);
        }
    }

    map.set(brand, today);

    const content = Array.from(map.entries())
        .map(([label, date]) => `${label}: ${date}`)
        .join("\n");

    fs.writeFileSync(TRACK_FILE, content, "utf8");
}

export { appendToGoogleSheet, hasRunToday, markAsRunToday };
