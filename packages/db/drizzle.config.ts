import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.TURSO_DB_URL) {
	throw new Error("TURSO_DB_URL is not set");
}
if (!process.env.TURSO_DB_AUTH_TOKEN) {
	throw new Error("TURSO_DB_AUTH_TOKEN is not set");
}
export default {
	dbCredentials: {
		url: process.env.TURSO_DB_URL,
		authToken: process.env.TURSO_DB_AUTH_TOKEN,
	},
	dialect: "sqlite",
	driver: "turso",
	out: "./migrations",
	schema: "./models/",
} satisfies Config;
