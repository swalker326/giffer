import { db } from "@giffer/db";
import {
	type LoaderFunctionArgs,
	type SerializeFrom,
	json,
} from "@remix-run/node";
import { useFetchers, useLoaderData } from "@remix-run/react";
import { BotIcon } from "lucide-react";
import React from "react";
import Markdown from "react-markdown";
import { useAutoScroll } from "~/hooks/useAutoScroll";
import { cn } from "~/lib/utils";
import { CodeBlock } from "~/routes/optimize/components/CodeBlock";
import { requireUserId } from "../services/auth.server";

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
type message = SerializeFrom<typeof loader>["messages"][number];
export default function Optimize() {
	let { messages } = useLoaderData<typeof loader>();
	const fetchers = useFetchers();
	const optimisticMessages = fetchers.reduce<message[]>((memo, fetcher) => {
		if (fetcher.formData) {
			if (fetcher.key !== "message.send") {
				return memo;
			}
			const d = Object.fromEntries(fetcher.formData);
			console.log("DATA", d);
			memo.push({
				id: fetcher.key,
				content: fetcher.formData.get("prompt") as string,
				createdBy: "user",
				conversationId: fetcher.formData.get("conversationId") as string,
				createdAt: new Date().toISOString(),
				commands: "",
				updatedAt: new Date().toISOString(),
			});
		}
		return memo;
	}, []);
	messages = [...messages, ...optimisticMessages];
	const { containerRef, scrollToBottom } = useAutoScroll();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	return (
		<div ref={containerRef} className="grow overflow-y-auto p-4 w-full">
			<div className="sm:container sm:max-w-4xl sm:mx-auto flex flex-col">
				{messages.map((message) => (
					<div
						key={message.id}
						className={cn(
							`${message.createdBy === "ai" ? "bg-transparent rounded-lg self-start" : "bg-gray-200 self-end rounded-lg rounded-br-none max-w-[75%]"} p-3 flex gap-3 `,
						)}
					>
						{message.createdBy === "ai" && (
							<BotIcon className="text-purple-500 w-8 h-8" />
						)}
						<div
							className={`${message.createdBy !== "ai" && "max-w-[75%]"} prose prose-sm sm:prose lg:prose-lg max-w-full mx-auto px-4`}
						>
							<Markdown>{message.content}</Markdown>
							{message.commands
								? JSON.parse(message.commands).map(
										(command: string, index: number) => (
											<Markdown
												components={{
													code: (props) => {
														const { node, children, ...rest } = props;
														return <CodeBlock>{children}</CodeBlock>;
													},
												}}
												key={`${message.id}-command-${index}`}
											>{`	${command}`}</Markdown>
										),
									)
								: null}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
