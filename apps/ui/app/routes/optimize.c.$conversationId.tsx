import { db } from "@giffer/db";
import {
	type LoaderFunctionArgs,
	type SerializeFrom,
	json,
} from "@remix-run/node";
import { useFetchers, useLoaderData } from "@remix-run/react";
import Markdown from "react-markdown";
import { requireUserId } from "../services/auth.server";
import { cn } from "~/lib/utils";
import { BotIcon, CopyIcon } from "lucide-react";
import React from "react";
import { useAutoScroll } from "~/hooks/useAutoScroll";

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
		<div ref={containerRef} className="grow overflow-y-auto p-4 w-full ">
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
	);
}

const CodeBlock = ({ children }: { children?: React.ReactNode }) => {
	const [isCopied, setIsCopied] = React.useState(false);
	React.useEffect(() => {
		if (isCopied) {
			const timeout = setTimeout(() => {
				setIsCopied(false);
			}, 2000);
			return () => {
				clearTimeout(timeout);
			};
		}
	}, [isCopied]);
	return (
		<div className="relative">
			{isCopied ? (
				<span className="absolute -top-5 right-0 text-gray-400 rounded-lg h-4">
					Copied!
				</span>
			) : (
				<CopyIcon
					className="absolute right-1 -top-4 w-4 h-4 text-gray-400 cursor-pointer"
					onClick={() => {
						navigator.clipboard.writeText((children as string).trim());
						setIsCopied(true);
					}}
				/>
			)}
			<pre className="bg-gray-800 text-white p-1 rounded-lg">{children}</pre>
		</div>
	);
};
