import { nanoid } from "nanoid";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const seeded = sqliteTable("seeded", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	isSeeded: int("isSeeded", { mode: "boolean" }).notNull(),
});
