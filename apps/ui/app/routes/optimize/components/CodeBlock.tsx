import { CopyIcon } from "lucide-react";
import React from "react";

export const CodeBlock = ({ children }: { children?: React.ReactNode }) => {
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
