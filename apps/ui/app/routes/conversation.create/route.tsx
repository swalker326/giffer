import { db } from "@giffer/db";
import { conversation } from "@giffer/db/models/conversation";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const [newConvo] = await db
		.insert(conversation)
		.values({
			userId,
			label: "New Conversation",
		})
		.returning();
	if (!newConvo) {
		throw new Error("Failed to create conversation");
	}
	return json({
		status: 200,
		conversation: newConvo,
	});
}
