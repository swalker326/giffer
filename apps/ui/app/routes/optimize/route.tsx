import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, Outlet, useLoaderData } from "@remix-run/react";
import { getConversationsWithMessages } from "~/models/conversation.server";
import { requireUserId } from "~/services/auth.server";
import { ConversationInput } from "./components/ConversationInput";
import { ConversationList } from "./components/ConversationList";
import { Suspense } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const conversations = getConversationsWithMessages(userId);
	return {
		conversations,
	};
};

export default function OptimizeRoute() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<div className="h-screen flex bg-white w-full">
			<Suspense fallback={<div>Loading Conversations</div>}>
				<Await resolve={loaderData.conversations}>
					{(data) => <ConversationList conversations={data} />}
				</Await>
			</Suspense>
			<div className="flex flex-col h-screen w-full flex-1">
				<Outlet />
				<div className="px-2">
					<ConversationInput />
				</div>
			</div>
		</div>
	);
}
