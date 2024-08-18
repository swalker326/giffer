import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
	sql,
} from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { conversation } from "./conversation";

export const message = sqliteTable("message", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	content: text("content").notNull(),
	commands: text("commands", { mode: "json" }).$type<string[]>(),
	conversationId: text("conversationId").references(() => conversation.id, {
		onDelete: "cascade",
	}),
	media: text("media"),
	createdBy: text("createdBy").notNull(),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const messageRelations = relations(message, ({ one }) => ({
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id],
	}),
}));

export type SelectMessage = InferSelectModel<typeof message>;
export type InsertMessage = InferInsertModel<typeof message>;
