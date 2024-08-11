import type { SerializeFrom } from "@remix-run/node";
import type { getConversationsWithMessages } from "~/models/conversation.server";
import { ChatMessage } from "./Message";

export function Conversation({
	messages,
}: {
	messages: SerializeFrom<
		typeof getConversationsWithMessages
	>[number]["messages"];
}) {
	return (
		<div className="space-y-4">
			{messages.map((message) => (
				<ChatMessage key={message.id} message={message} />
			))}
		</div>
	);
}
