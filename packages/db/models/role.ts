import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { permissionToRole } from "./permission-to-role";
import { roleToUser } from "./role-to-user";

export const role = sqliteTable("role", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
	createdAt: int("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: int("updatedAt", { mode: "timestamp" }),
});

export const rolesRelations = relations(role, (helpers) => ({
	users: helpers.many(roleToUser),
	permissions: helpers.many(permissionToRole),
}));
