import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, int, unique } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { permissionToRole } from "./permission-to-role";

export const permission = sqliteTable(
	"permission",
	{
		id: text("id").primaryKey().$defaultFn(nanoid),
		action: text("action", {
			enum: ["create", "read", "update", "delete"],
		}).notNull(),
		entity: text("entity", { enum: ["user", "sign", "video"] }).notNull(),
		access: text("access", {
			enum: ["own", "any", "own,any", "any,own"],
		}).notNull(),
		description: text("description").default("").notNull(),
		createdAt: int("createdAt", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: int("updatedAt", { mode: "timestamp" }),
	},
	(t) => ({
		title: unique().on(t.action, t.entity, t.access),
	}),
);

export const permissionRelations = relations(permission, (helpers) => ({
	roles: helpers.many(permissionToRole),
}));

export type Action = "create" | "read" | "update" | "delete";
export type Entity = "user" | "sign" | "video";
export type Access = "own" | "any" | "own,any" | "any,own";
export type PermissionString = `${Action}:${Entity}:${Access}`;
