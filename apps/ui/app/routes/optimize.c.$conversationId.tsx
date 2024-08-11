import { db } from "@giffer/db";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import Markdown from "react-markdown";
import { requireUserId } from "../services/auth.server";
import { cn } from "~/lib/utils";
import { BotIcon, UserIcon } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const conversationId = params.conversationId;
	if (!conversationId) {
		throw new Error("No conversation ID provided");
	}
	await requireUserId(request, { redirectTo: "/login" });
	const messages = await db.query.message.findMany({
		where: (message, { eq }) => eq(message.conversationId, conversationId),
	});
	return json({
		status: 200,
		messages,
	});
}

export default function Optimize() {
	const { messages } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col gap-3">
			{messages.map((message) => (
				<div
					key={message.id}
					className={cn(
						`${message.createdBy === "ai" ? "bg-transparent rounded-lg" : "bg-gray-200 self-end rounded-lg rounded-br-none"} p-3 flex gap-3`,
					)}
				>
					{message.createdBy === "ai" && (
						<BotIcon className="text-purple-500 w-8 h-8" />
					)}
					<div className="prose">
						<Markdown>{message.content}</Markdown>
						{message.commands
							? JSON.parse(message.commands).map((command: string) => (
									<Markdown key="">{`	${command}`}</Markdown>
								))
							: null}
					</div>
				</div>
			))}
		</div>
	);
}
