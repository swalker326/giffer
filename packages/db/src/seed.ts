import { sampleWords } from "../sampleWords";
import { slugerize } from "../slugerize";
import { db, eq, inArray } from "./index";
import { schema } from "../models/schema";

export async function seed() {
	console.time("🔑 Created permissions...");
	const entities = ["user", "sign", "video"] as const;
	const actions = ["create", "read", "update", "delete"] as const;
	const accesses = ["own", "any"] as const;
	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await db.insert(schema.permission).values({ entity, action, access });
			}
		}
	}
	console.timeEnd("🔑 Created permissions...");
	console.time("👑 Created roles...");
	await db.transaction(async (tx) => {
		const userPermissions = await tx.query.permission.findMany({
			where: (p, { eq }) => eq(p.access, "own"),
		});
		const adminPermissions = await tx.query.permission.findMany({
			where: (p, { eq }) => eq(p.access, "any"),
		});
		const adminRole = await tx
			.insert(schema.role)
			.values({
				name: "admin",
			})
			.returning({ id: schema.role.id });
		const userRole = await tx
			.insert(schema.role)
			.values({
				name: "user",
			})
			.returning({ id: schema.role.id });
		await tx.insert(schema.permissionToRole).values(
			userPermissions.map((p) => ({
				roleId: userRole[0].id,
				permissionId: p.id,
			})),
		);
		await tx.insert(schema.permissionToRole).values(
			adminPermissions.map((p) => ({
				roleId: adminRole[0].id,
				permissionId: p.id,
			})),
		);
	});

	console.timeEnd("👑 Created roles...");
	console.time("Adding sample words...");
	for (let category in sampleWords) {
		category = category as keyof typeof sampleWords;
		const words = sampleWords[category as keyof typeof sampleWords];
		const wordList = words.map(({ word }) => word);
		await db.insert(schema.category).values({
			name: category,
			slug: slugerize(category),
		});
		const wordMatches = await db
			.select()
			.from(schema.term)
			.where(inArray(schema.term.word, wordList));

		const newTerms = wordList
			.filter((w) => !wordMatches.some((m) => m.word === w))
			.map((word) => ({
				categoryId: 10, //invalid attribute
				word,
				slug: slugerize(word),
			}));
		newTerms;

		await db.insert(schema.term).values(newTerms);

		for (const { word, definition } of words) {
			const term = await db
				.select()
				.from(schema.term)
				.where(eq(schema.term.word, word));

			if (!term) throw new Error(`Term ${word} not found`);
			await db.insert(schema.sign).values({
				example: definition,
				termId: term[0].id,
				definition: definition,
				createdAt: new Date(),
			});
		}

		console.time("Adding sample words...");
		// for (const category in sampleWords) {
		let cat = await db.query.category.findFirst({
			where: (cat, { eq }) => eq(cat.name, category),
		});

		if (!cat) {
			[cat] = await db
				.insert(schema.category)
				.values({
					name: category,
					slug: slugerize(category),
				})
				.returning();
		}
		if (!cat) {
			console.warn("Category not found", category);
			continue;
		}
		const categoryWords = sampleWords[category as keyof typeof sampleWords];
		for (const { word } of categoryWords) {
			const term = await db
				.select()
				.from(schema.term)
				.where(eq(schema.term.word, word));
			if (!term || term.length === 0) {
				continue;
			}
			const sign = await db.query.sign.findFirst({
				where: (sign, { eq }) => eq(sign.termId, term[0].id),
			});

			if (!sign) {
				continue;
			}
			try {
				await db.insert(schema.categoryToSign).values({
					categoryId: cat.id,
					signId: sign.id,
				});
			} catch (e) {
				console.error("Error adding category to sign");
			}
		}
		// }
		console.timeEnd("Adding sample words...");
	}
}

seed();
