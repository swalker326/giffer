import { SerializeFrom } from "@remix-run/node";
import Markdown from "react-markdown";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { getConversationsWithMessages } from "~/models/conversation.server";

const SenderSchema = z.enum(["user", "bot"]);
export type Sender = z.infer<typeof SenderSchema>;

export function ChatMessage({
	message,
}: {
	message: SerializeFrom<
		typeof getConversationsWithMessages
	>[number]["messages"][number];
}) {
	return (
		<div>
			<Markdown>{message.content}</Markdown>
		</div>
	);
}
