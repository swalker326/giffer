import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const session = sqliteTable("session", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	expirationDate: int("expirationDate", { mode: "timestamp" }).notNull(),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	userId: text("userId")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
});

export const sessionsRelations = relations(session, (helpers) => ({
	user: helpers.one(user, {
		relationName: "sessionToUser",
		fields: [session.userId],
		references: [user.id],
	}),
}));
