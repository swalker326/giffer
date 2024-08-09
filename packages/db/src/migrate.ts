import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import { db } from ".";

export const client = createClient({
	url: process.env.TURSO_DB_URL as string,
	authToken: process.env.TURSO_DB_AUTH_TOKEN as string,
});

console.log("Migrating tables...");
async function main() {
	try {
		await migrate(db, {
			migrationsFolder: "migrations",
		});
		console.log("Tables migrated!");
		process.exit(0);
	} catch (error) {
		console.error("Error performing migration: ", error);
		process.exit(1);
	}
}

await main();
