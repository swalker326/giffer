import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import { db } from "@giffer/db";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { parseMultipartRequest } from "@mjackson/multipart-parser";
import { MultipartParseError } from "@mjackson/multipart-parser";
import { runFFmpegCommand } from "~/ffmpeg/ffmpeg.server";

const RunCommandSchema = z.object({
	command: z.string(),
	file: z.instanceof(File),
});
type RunCommand = z.infer<typeof RunCommandSchema>;

export async function loader({ params }: LoaderFunctionArgs) {
	const messageId = params.messageId;
	if (!messageId) {
		throw new Error("No message ID provided");
	}
	const message = await db.query.message.findFirst({
		where: (message, { eq }) => eq(message.id, messageId),
	});

	if (!message) {
		throw new Error("Message not found");
	}
	if (!message.commands || !message.commands.length) {
		throw new Error("No commands found");
	}
	return json({ message });
}

type TextResponse = { name: string; value: string };
type FileResponse = {
	name: string;
	value: AsyncIterable<Uint8Array>;
	filename: string;
};

const isFileResponse = (
	response: TextResponse | FileResponse,
): response is FileResponse => "filename" in response;

type ParsedResponse = Record<string, TextResponse | FileResponse>;

export async function action({ request }: ActionFunctionArgs) {
	const responseObject: ParsedResponse = {} as ParsedResponse;
	for await (const part of parseMultipartRequest(request, {
		maxFileSize: 100000000,
	})) {
		if (!part.name) {
			continue;
		}
		if (part.isFile) {
			if (!part.filename) {
				throw new MultipartParseError("No filename found");
			}
			async function* uint8ArrayToAsyncIterable(
				array: Uint8Array,
			): AsyncIterable<Uint8Array> {
				yield array;
			}
			const itr = uint8ArrayToAsyncIterable(await part.bytes());

			responseObject.file = {
				name: part.name,
				value: itr,
				filename: part.filename,
			};
		} else {
			responseObject[part.name] = { name: part.name, value: await part.text() };
		}
	}
	const file = responseObject.file;
	const command = responseObject.command;

	if (!file) {
		throw new MultipartParseError("No file found");
	}
	if (!command || !command.value || typeof command.value !== "string") {
		throw new MultipartParseError("No command found");
	}
	if (!isFileResponse(file)) {
		throw new MultipartParseError("File is not a file");
	}

	const { url, id: fileId } = await runFFmpegCommand(
		command.value,
		file.value,
		file.filename,
	);
	return json({ command, url }, { status: 200 });
}
export default function OptimizeRunRoute() {
	const { message } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	console.log("::ACTION DATA", actionData);

	const [form, fields] = useForm<RunCommand>({
		defaultValue: {
			command: message.commands?.[0] || "",
		},
	});
	return (
		<div>
			<Form method="POST" {...getFormProps(form)} encType="multipart/form-data">
				<Input {...getInputProps(fields.command, { type: "text" })} />
				<div>{fields.command.errors}</div>
				<Input {...getInputProps(fields.file, { type: "file" })} />
				<div>{fields.file.errors}</div>
				<Button type="submit">Run</Button>
			</Form>
			{actionData?.url && <img alt="results" src={actionData.url} />}
		</div>
	);
}
