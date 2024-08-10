import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, real, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const video = sqliteTable("video", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	videoId: text("videoId").notNull(), //ID in db maybe this should be the same id and videoId should be the same
	userId: text("userId")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	url: text("url").notNull(),
});

export const videosRelations = relations(video, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToVideo",
		fields: [video.userId],
		references: [user.id],
	}),
	// sign: helpers.one(sign, {
	// 	relationName: "videosToSign",
	// 	fields: [video.signId],
	// 	references: [sign.id],
	// }),
	// votes: helpers.many(vote, { relationName: "videoToVotes" }),
	// favorites: helpers.many(favorite, { relationName: "videoToFavorites" }),
	// reports: helpers.many(report, { relationName: "videoToReports" }),
}));
