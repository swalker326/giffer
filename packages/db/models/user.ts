import {
	InferInsertModel,
	InferSelectModel,
	relations,
	sql,
} from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { connection } from "./connection";
import { roleToUser } from "./role-to-user";
import { session } from "./session";
import { userImage } from "./user-image";
import { video } from "./video";

export const user = sqliteTable("user", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	email: text("email").notNull(),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const usersRelations = relations(user, (helpers) => ({
	uploadedVideos: helpers.many(video, { relationName: "userToVideo" }),
	roles: helpers.many(roleToUser),
	image: helpers.one(userImage, {
		relationName: "userToUserImage",
		fields: [user.id],
		references: [userImage.userId],
	}),
	sessions: helpers.many(session, { relationName: "sessionToUser" }),
	connections: helpers.many(connection, { relationName: "connectionToUser" }),
}));

export type SelectUser = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;
