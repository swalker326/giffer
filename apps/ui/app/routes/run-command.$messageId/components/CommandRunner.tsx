import { type FetcherWithComponents, useFetcher } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { FileUpload } from "~/components/FileUpload";

export function CommandRunner({
	messageId,
	commandFetcher,
	setFile,
}: {
	messageId: string;
	commandFetcher: FetcherWithComponents<unknown>;
	setFile: Dispatch<SetStateAction<File | null>>;
}) {
	return (
		<div>
			<commandFetcher.Form>
				<FileUpload setFile={setFile} />
				<input type="text" name="command" />
			</commandFetcher.Form>
		</div>
	);
}
