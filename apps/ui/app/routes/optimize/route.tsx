import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getConversationsWithMessages } from "~/models/conversation.server";
import { requireUserId } from "~/services/auth.server";
import { ConversationInput } from "./components/ConversationInput";
import { ConversationList } from "./components/ConversationList";
import React from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const conversations = await getConversationsWithMessages(userId);
	return json({
		conversations,
	});
};

export default function OptimizeRoute() {
	const { conversations } = useLoaderData<typeof loader>();

	return (
		<div className="h-screen flex bg-white w-full">
			<ConversationList conversations={conversations} />
			<div className="flex flex-col h-screen w-full">
				<Outlet />
				<ConversationInput />
			</div>
		</div>
	);
}
