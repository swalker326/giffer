import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { permission } from "./permission";
import { role } from "./role";

export const permissionToRole = sqliteTable("permissionToRole", {
	roleId: text("roleId").notNull(),
	permissionId: text("permissionId").notNull(),
});

export const permissionToRoleRelations = relations(
	permissionToRole,
	(helpers) => ({
		permission: helpers.one(permission, {
			fields: [permissionToRole.permissionId],
			references: [permission.id],
		}),
		role: helpers.one(role, {
			fields: [permissionToRole.roleId],
			references: [role.id],
		}),
	}),
);
