// user: X73HcFfRSKHB6Cib6exNJ
// admin-role: JvWFifdEMMfxDHuGBmGKN

import { db, eq, schema } from "./src";

const sign = await db.query.sign.findMany({
	limit: 10,
});
console.log("description", !!sign[0].description);

// await db.insert(schema.sign).values({
// 	termId: "RFjv6JilbTnplHp6MNlVr",
// 	definition:
// 		"A mountain or hill, typically conical, having a crater or vent through which lava, rock fragments, hot vapor, and gas are being or have been erupted from the earth's crust.",
// 	example: "I climbed a volcano in Hawaii.",
// });
// type FetchFunctionProps = {
// 	limit?: number;
// };
// const fetchSignsWithCategories = async ({ limit }: FetchFunctionProps) => {
// 	const signs = await db.query.sign.findMany({
// 		...(limit ? { limit } : {}),
// 		with: {
// 			categories: { with: { category: true } },
// 			term: true,
// 		},
// 	});
// 	return signs.map((sign) => ({
// 		...sign,
// 		categories: sign.categories.map((category) => category.category),
// 	}));
// };

// // await db.insert(schema.sign).values({
// // 	termId: "L5Ym7jabQP6JFg4a7Nh3v",
// // 	definition:
// // 		"a domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, and a barking, howling, or whining voice. It is widely kept as a pet or for work or field sports.",
// // 	example: "I have a dog named Max.",
// // 	description: ""
// // });

// // await db.insert(term).values({
// // 	word: "dog",
// // });
// // const term = await db.query.term.findMany({ with: { signs: true } });
// // for (const t of term) {
// // 	for (const s of t.signs) {
// // 		console.log(s);
// // 	}
// // }
// // console.log(term);
// // await db
// // 	.update(sign)
// // 	.set({
// // 		termId: "k58g_sqBxIEr7xnBs52sz",
// // 	})
// // 	.where(eq(sign.id, "Fb-5erEJET2pEm0xgRq8L"));

// // const myterm = await db.query.sign.findMany({
// // 	with: { term: true },
// // });
// // console.log(myterm);

// // await db
// // 	.insert(schema.permission)
// // 	.values({ action: "create", entity: "user", access: "own" });
