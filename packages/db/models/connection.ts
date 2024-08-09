import { relations, sql } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const connection = sqliteTable("connection", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	providerName: text("providerName").notNull(),
	providerId: text("providerId").notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	userId: text("userId").notNull(),
});

export const connectionRelations = relations(connection, (helpers) => ({
	user: helpers.one(user, {
		relationName: "connectionToUser",
		fields: [connection.userId],
		references: [user.id],
	}),
}));

export type SelectConnection = InferSelectModel<typeof connection>;
export type InsertConnection = InferInsertModel<typeof connection>;
