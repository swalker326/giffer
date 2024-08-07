export function FFMPEGCommand({ command }: { command: string }) {
	return (
		//a code block with a copy button
		<div className="bg-gray-200 border w-full">
			<pre>{command}</pre>
			<button>Copy</button>
		</div>
	);
}
