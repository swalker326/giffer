import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { role } from "./role";
import { user } from "./user";

export const roleToUser = sqliteTable("roleToUser", {
	userId: text("userId").notNull(),
	roleId: text("roleId").notNull(),
});

export const rolesToUsersRelations = relations(roleToUser, (helpers) => ({
	role: helpers.one(role, {
		fields: [roleToUser.roleId],
		references: [role.id],
	}),
	user: helpers.one(user, {
		fields: [roleToUser.userId],
		references: [user.id],
	}),
}));
