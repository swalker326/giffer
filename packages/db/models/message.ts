import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { conversation } from "./conversation";

export const message = sqliteTable("message", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	content: text("content").notNull(),
	conversationId: text("conversationId").notNull(),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const messageRelations = relations(message, ({ one }) => ({
	conversation: one(conversation, {
		relationName: "conversationToMessage",
		fields: [message.conversationId],
		references: [conversation.id],
	}),
}));
