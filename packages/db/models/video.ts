import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, real, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";
import { sign } from "./sign";
import { favorite } from "./favorite";
import { vote } from "./vote";
import { report } from "./report";

export const video = sqliteTable("video", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	videoId: text("videoId").notNull(),
	trendingScore: real("trendingScore").default(0).notNull(),
	signId: text("signId")
		.references(() => sign.id, { onDelete: "cascade" })
		.notNull(),
	userId: text("userId")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	voteCount: int("voteCount", { mode: "number" }).default(0).notNull(),
	url: text("url").notNull(),
	approvedOn: int("approvedOn", { mode: "timestamp" }),
	status: text("status", {
		enum: ["ACTIVE", "REJECTED", "PENDING"],
	}).notNull(),
});

export const videosRelations = relations(video, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToVideo",
		fields: [video.userId],
		references: [user.id],
	}),
	sign: helpers.one(sign, {
		relationName: "videosToSign",
		fields: [video.signId],
		references: [sign.id],
	}),
	votes: helpers.many(vote, { relationName: "videoToVotes" }),
	favorites: helpers.many(favorite, { relationName: "videoToFavorites" }),
	reports: helpers.many(report, { relationName: "videoToReports" }),
}));
