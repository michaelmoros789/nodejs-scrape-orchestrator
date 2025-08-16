import cron from "node-cron";

import { appendToGoogleSheet, hasRunToday, markAsRunToday } from "./helpers.js";
import productA from "./scrapers/product-a.js";
import productB from "./scrapers/product-b.js";
import { logger } from "./logger.js";

const jobs = [
    {
        name: "ProductA",
        scrapeFn: productA,
        params: { headless: true },
        maxRetries: 1,
    },
    {
        name: "ProductB",
        scrapeFn: productB,
        params: { headless: true },
    },
];

async function runScrapeJob(name, scrapeFn, params = {}, maxRetries = 3) {
    if (hasRunToday(name)) {
        logger.info(`${name} already scraped today. Skipping.`);
        return;
    }

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            attempt++;
            logger.info(
                `Running ${name} scrape (attempt ${attempt}/${maxRetries})...`
            );

            const data = await scrapeFn(params);

            if (data.length > 0) {
                await appendToGoogleSheet(data);
                markAsRunToday(name);
                logger.info(`${name} scrape completed and data appended.`, {
                    records: data.length,
                });
            } else {
                logger.warn(`No ${name} products found.`);
            }
            return;
        } catch (err) {
            logger.error(
                `${name} scrape failed (attempt ${attempt}): ${
                    err.stack || err.message
                }`
            );

            if (attempt < maxRetries) {
                logger.warn(`Retrying ${name} in 5 seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } else {
                logger.error(`${name} failed after ${maxRetries} attempts.`);
            }
        }
    }
}

async function runScrapeJobs() {
    for (const job of jobs) {
        const { name, scrapeFn, params = {}, maxRetries = 3 } = job;
        await runScrapeJob(name, scrapeFn, params, maxRetries);
    }
}

// Run immediately
runScrapeJobs();

// Schedule the job to run daily at 1:00 AM Manila time
cron.schedule("0 1 * * *", async () => {
    logger.info("Running scheduled scrape at 1:00 AM...");
    await runScrapeJobs();
});
