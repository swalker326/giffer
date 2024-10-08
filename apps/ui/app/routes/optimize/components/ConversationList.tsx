import { parseWithZod } from "@conform-to/zod";
import { NavLink, useFetcher, useNavigate } from "@remix-run/react";
import {
	EditIcon,
	PencilIcon,
	SidebarCloseIcon,
	SidebarOpen,
	XIcon,
} from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import type { getConversationsWithMessages } from "~/models/conversation.server";
import type { action as conversationCreateAction } from "~/routes/conversation.create";
import {
	UpdateConversationSchema,
	type action as conversationEditAction,
} from "~/routes/conversation.edit";
import type { action as conversationDeleteAction } from "~/routes/conversation.delete";
import { DeleteConfirmationAlert } from "./DeleteConfirmationAlert";

export function ConversationList({
	conversations,
}: {
	conversations: Awaited<ReturnType<typeof getConversationsWithMessages>>;
}) {
	const navigate = useNavigate();
	const renameFetcher = useFetcher<typeof conversationEditAction>();
	const deleteFetcher = useFetcher<typeof conversationDeleteAction>();
	const [editConversationId, setEditConversationId] = React.useState<string>();
	const [expanded, setExpanded] = React.useState(false);
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
		<div
			className={`${expanded ? "w-1/2 md:w-1/4 lg:1-1/6 bg-gray-100" : "w-11 bg-transparent"} transition-all duration-200 absolute top-0 left-0 h-full z-50`}
		>
			<div className="space-2 h-full relative px-2 py-12">
				{!expanded ? (
					<div>
						<Button
							size="icon"
							type="submit"
							variant="ghost"
							className=" top-1 right-1 absolute hover:bg-gray-200"
							onClick={() => setExpanded(!expanded)}
						>
							<SidebarOpen />
						</Button>
					</div>
				) : (
					<div>
						<div className="top-1 right-1 absolute flex gap-0.5">
							<Button
								size="icon"
								type="submit"
								variant="ghost"
								className=" hover:bg-gray-200"
								onClick={() => setExpanded(!expanded)}
							>
								<SidebarCloseIcon />
							</Button>
							<createConversationFetcher.Form
								action="/conversation/create"
								method="POST"
							>
								<Button
									size="icon"
									type="submit"
									variant="ghost"
									className=" hover:bg-gray-200"
								>
									<EditIcon />
								</Button>
							</createConversationFetcher.Form>
						</div>

						<div className="flex flex-col">
							{conversations.map(({ id, label }) => (
								<div className="relative" key={id}>
									{!editConversationId || editConversationId !== id ? (
										<div className="group flex gap-2 justify-between hover:bg-gray-200 p-1 rounded-md items-center min-h-10 relative">
											<NavLink
												to={`c/${id}`}
												className={({ isActive }) =>
													`${isActive ? "group-bg-gray-200 underline font-semibold " : "bg-transparent"} group-hover:bg-gray-200 group-hover:opacity-40 flex-grow`
												}
											>
												{label}
											</NavLink>
											<div className="flex gap-1 right-0">
												<button
													type="button"
													className="p-1 hover:bg-gray-300 rounded-full"
													onClick={() => setEditConversationId(id)}
												>
													<PencilIcon className="hidden group-hover:block w-5 h-5" />
												</button>

												{/* <button
										type="button"
										className="p-1 hover:bg-gray-300 rounded-full"
										onClick={(() = setConfirm(true))}
									>
										<XIcon className=" text-red-600 hidden group-hover:block w-5 h-5" />
									</button> */}
											</div>
											<DeleteConfirmationAlert
												cancelText="No Cancel"
												deleteText="Delete"
												onConfirm={() => {
													deleteFetcher.submit(
														{ conversationId: id },
														{
															action: "/conversation/delete",
															method: "DELETE",
														},
													);
													conversations = conversations.filter(
														(convo) => convo.id !== id,
													);
												}}
											/>
										</div>
									) : (
										<renameFetcher.Form
											method="POST"
											action="/conversation/edit"
											onSubmit={(e) => {
												const formData = new FormData(e.currentTarget);
												const submission = parseWithZod(formData, {
													schema: UpdateConversationSchema,
												});
												if (submission.status !== "success") {
													throw new Error("Invalid form submission");
												}
												const convo = conversations.find(
													({ id }) => id === submission.value.conversationId,
												);
												if (convo) {
													convo.label = submission.value.label;
												}
												setEditConversationId("");
											}}
										>
											<div className="relative">
												<input name="conversationId" type="hidden" value={id} />
												<input
													name="label"
													className="w-full p-1 rounded-sm border "
													defaultValue={label}
												/>
											</div>
										</renameFetcher.Form>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
