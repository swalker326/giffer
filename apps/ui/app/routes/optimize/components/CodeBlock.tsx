import { CopyIcon, TerminalIcon } from "lucide-react";
import React from "react";
import { Link } from "@remix-run/react";

export const CodeBlock = ({
	children,
	messageId,
}: { children?: React.ReactNode; messageId: string }) => {
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
			<div className="flex gap-1 justify-end border-b-2 pb-2 items-center">
				<div>
					<Link to={`/run-command/${messageId}`}>
						<TerminalIcon className="w-7 h-7 text-gray-400 p-1 hover:text-gray-200" />
					</Link>
				</div>

				{isCopied ? (
					<div className=" text-gray-400 rounded-lg h-7">Copied!</div>
				) : (
					<CopyIcon
						className="w-7 h-7 text-gray-400 p-1 hover:text-gray-200 cursor-pointer"
						onClick={() => {
							navigator.clipboard.writeText((children as string).trim());
							setIsCopied(true);
						}}
					/>
				)}
			</div>
			<pre className="bg-gray-800 text-white p-1 rounded-lg">{children}</pre>
		</div>
	);
};
