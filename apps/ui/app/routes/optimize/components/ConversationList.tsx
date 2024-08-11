import type { SerializeFrom } from "@remix-run/node";
import { Link, NavLink, useFetcher, useNavigate } from "@remix-run/react";
import { EditIcon } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import type { getConversationsWithMessages } from "~/models/conversation.server";
import type { action as conversationCreateAction } from "~/routes/conversation.create/route";

export function ConversationList({
	conversations,
}: {
	conversations: SerializeFrom<typeof getConversationsWithMessages>;
}) {
	const navigate = useNavigate();
	const createConversationFetcher =
		useFetcher<typeof conversationCreateAction>();
	React.useEffect(() => {
		if (createConversationFetcher.data?.conversation) {
			navigate(
				`/optimize/c/${createConversationFetcher.data.conversation?.id}`,
			);
		}
	}, [createConversationFetcher.data, navigate]);
	return (
		<div className="space-2 h-full bg-gray-100 w-64 relative px-2 py-12">
			<createConversationFetcher.Form
				action="/conversation/create"
				method="POST"
			>
				<Button
					type="submit"
					variant="ghost"
					className=" p-0 w-10 h-10 top-1 right-1 absolute hover:bg-gray-200 rounded-full"
				>
					<EditIcon />
				</Button>
			</createConversationFetcher.Form>

			<div className="flex flex-col">
				{conversations.map(({ id, label }) => (
					// <Conversation key={id} messages={messages} />
					<NavLink
						to={`c/${id}`}
						key={id}
						className={({ isActive }) =>
							`${isActive ? "bg-gray-200" : "bg-transparent"} p-2 rounded-md hover:bg-gray-200`
						}
					>
						{label}
					</NavLink>
				))}
			</div>
		</div>
	);
}
