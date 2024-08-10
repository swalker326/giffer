import { SerializeFrom } from "@remix-run/node";
import { ChatMessage, Sender } from "./Message";
import { getConversationsWithMessages } from "~/models/conversation.server";

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
