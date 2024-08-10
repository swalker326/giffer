import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { message } from "./message";
import { user } from "./user";

export const conversation = sqliteTable("conversation", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	userId: text("userId").notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const conversationRelations = relations(conversation, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToConversation",
		fields: [conversation.userId],
		references: [user.id],
	}),
	messages: helpers.many(message, { relationName: "conversationToMessage" }),
}));
