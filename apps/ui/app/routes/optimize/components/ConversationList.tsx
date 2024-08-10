import { Conversation } from "./Conversation";
import { getConversationsWithMessages } from "~/models/conversation.server";
import { SerializeFrom } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { EditIcon } from "lucide-react";
import { useFetcher } from "@remix-run/react";
import { action as conversationCreateAction } from "~/routes/conversation.create/route";

export function ConversationList({
	conversations,
}: {
	conversations: SerializeFrom<typeof getConversationsWithMessages>;
}) {
	const createConversationFetcher =
		useFetcher<typeof conversationCreateAction>();
	return (
		<div className="space-y-2 h-full bg-gray-200 w-44 relative">
			<createConversationFetcher.Form
				action="/conversation/create"
				method="POST"
			>
				<Button type="submit" variant="outline">
					<EditIcon />
				</Button>
			</createConversationFetcher.Form>

			{conversations.map(({ id, label }) => (
				// <Conversation key={id} messages={messages} />
				<div key={id} className="space-y-4">
					{label}
				</div>
			))}
		</div>
	);
}
