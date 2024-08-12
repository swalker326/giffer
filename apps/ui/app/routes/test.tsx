import { Form } from "@remix-run/react";

export default function ChatRoute() {
	// Generate 100 dummy messages
	const dummyMessages = Array.from({ length: 100 }, (_, i) => ({
		id: i,
		text: `This is message number ${i + 1}`,
		sender: i % 2 === 0 ? "user" : "other",
	}));

	return (
		<div className="flex flex-col h-screen bg-gray-100 w-full">
			<div className="flex-1 overflow-hidden">
				<div className="h-full overflow-y-auto px-4 py-6">
					{dummyMessages.map((message) => (
						<div
							key={message.id}
							className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
						>
							<div
								className={`inline-block rounded-lg p-3 ${
									message.sender === "user"
										? "bg-blue-500 text-white"
										: "bg-white text-gray-800"
								}`}
							>
								<p className="text-sm">{message.text}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white border-t p-4">
				<Form method="post" className="flex">
					<input
						type="text"
						name="message"
						className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Type a message..."
					/>
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Send
					</button>
				</Form>
			</div>
		</div>
	);
}