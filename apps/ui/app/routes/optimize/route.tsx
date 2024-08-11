import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getConversationsWithMessages } from "~/models/conversation.server";
import { requireUserId } from "~/services/auth.server";
import { ConversationInput } from "./components/ConversationInput";
import { ConversationList } from "./components/ConversationList";

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
		<div className="flex h-full w-full gap-2 ">
			<ConversationList conversations={conversations} />
			<div className="flex flex-col w-full space-y-3 pr-3 pt-3">
				<div className="flex-1 border rounded-md p-3">
					<Outlet />
				</div>
				<ConversationInput />
			</div>
		</div>
	);
}
