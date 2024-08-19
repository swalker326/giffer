import { db } from "@giffer/db";
import { unstable_defineLoader } from "@remix-run/node";
import { Await, useFetchers, useLoaderData } from "@remix-run/react";
import { BotIcon } from "lucide-react";
import React, { Suspense } from "react";
import Markdown from "react-markdown";
import { useAutoScroll } from "~/hooks/useAutoScroll";
import { cn } from "~/lib/utils";
import { CodeBlock } from "~/routes/optimize/components/CodeBlock";
import { requireUserId } from "../services/auth.server";
import { fetchConversationMessages } from "~/models/messages.server";
import { MediaMessage } from "./optimize/components/MediaMessage";
import { StorageFactory } from "~/storage/StorageFactory";

export const loader = unstable_defineLoader(async ({ request, params }) => {
	const conversationId = params.conversationId;
	if (!conversationId) {
		throw new Error("No conversation ID provided");
	}
	await requireUserId(request, { redirectTo: "/login" });
	const messages = await fetchConversationMessages(conversationId);

	return {
		messages: fetchConversationMessages(conversationId),
	};
});

export default function Optimize() {
	const loaderData = useLoaderData<typeof loader>();
	// const optimisticMessages = fetchers.reduce<message[]>((memo, fetcher) => {
	// 	if (fetcher.formData) {
	// 		if (fetcher.key !== "message.send") {
	// 			return memo;
	// 		}
	// 		const d = Object.fromEntries(fetcher.formData);
	// 		memo.push({
	// 			id: fetcher.key,
	// 			content: fetcher.formData.get("prompt") as string,
	// 			createdBy: "user",
	// 			conversationId: fetcher.formData.get("conversationId") as string,
	// 			createdAt: new Date().toISOString(),
	// 			commands: [""],
	// 			updatedAt: new Date().toISOString(),
	// 		});
	// 	}
	// 	return memo;
	// }, []);
	// messages = [...messages, ...optimisticMessages];
	const { containerRef, scrollToBottom } = useAutoScroll();

	// biome-ignore lint/correctness/useExhaustiveDependencies: without firing on message changes any new
	React.useEffect(() => {
		scrollToBottom();
	}, [loaderData.messages, scrollToBottom]);

	return (
		<div ref={containerRef} className="grow overflow-y-auto p-4 w-full">
			<div className="sm:container sm:max-w-4xl sm:mx-auto flex flex-col">
				<Suspense fallback={<div>Loading Messages</div>}>
					<Await resolve={loaderData.messages}>
						{(messages) =>
							messages.map((message) => (
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
										{message.media && typeof message.media === "object" ? (
											<MediaMessage media={message.media} />
										) : null}
										{message.commands?.map((command: string, index: number) => (
											<Markdown
												components={{
													code: (props) => {
														const { node, children, ...rest } = props;
														return (
															<CodeBlock messageId={message.id}>
																{children}
															</CodeBlock>
														);
													},
												}}
												key={`${message.id}-command-${index}`}
											>{`	${command}`}</Markdown>
										)) || null}
									</div>
								</div>
							))
						}
					</Await>
				</Suspense>
			</div>
		</div>
	);
}
