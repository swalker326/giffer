import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, blob, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const userImage = sqliteTable("userImage", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	altText: text("altText"),
	contentType: text("contentType").notNull(),
	blob: blob("blob", { mode: "buffer" }).notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	userId: text("userId")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
});

export const userImageRelations = relations(userImage, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToUserImage",
		fields: [userImage.userId],
		references: [user.id],
	}),
}));
