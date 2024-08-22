import { XIcon } from "lucide-react";

export function ErrorContainer({
	title = "We've run into some problems",
	handleClick,
	content,
}: { content: string; handleClick: () => void; title?: string }) {
	return (
		<div
			id="server-error"
			className="rounded-md bg-red-100 top-0 right-0 p-3 mb-2"
		>
			<button
				className="absolute top-1 right-1"
				type="button"
				onClick={handleClick}
			>
				<XIcon />
			</button>
			<h4 className="text-lg text-red-600">{title}</h4>
			<pre className="bg-gray-700 p-2 text-gray-300 rounded-md text-wrap">
				{content}
			</pre>
		</div>
	);
}
