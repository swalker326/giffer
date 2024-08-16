import { parseWithZod } from "@conform-to/zod";
import { db, eq } from "@giffer/db";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { requireUserId } from "~/services/auth.server";
import { conversation as conversationTable } from "@giffer/db/models/conversation";

export const UpdateConversationSchema = z.object({
	conversationId: z.string(),
	label: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	await requireUserId(request, { redirectTo: "/login" });
	const submission = parseWithZod(formData, {
		schema: UpdateConversationSchema,
	});
	if (submission.status !== "success") {
		return submission.reply();
	}
	await db
		.update(conversationTable)
		.set({
			label: submission.value.label,
		})
		.where(eq(conversationTable.id, submission.value.conversationId));
	return json({ status: 200, message: "Conversation updated" });
}
