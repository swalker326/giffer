import { db, eq } from "@giffer/db";
import { conversation as conversationTable } from "@giffer/db/models/conversation";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
	await requireUserId(request, { redirectTo: "/login" });
	const formData = await request.formData();
	const conversationId = formData.get("conversationId") as string;
	if (!conversationId) {
		return json(
			{ status: 400, message: "Missing conversationId" },
			{ status: 400 },
		);
	}
	await db
		.delete(conversationTable)
		.where(eq(conversationTable.id, conversationId));
	return json({ status: 200, message: "Conversation deleted" });
}
