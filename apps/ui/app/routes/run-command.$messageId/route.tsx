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
import { MultipartParseError } from "@mjackson/multipart-parser";
import { runFFmpegCommand } from "~/ffmpeg/ffmpeg.server";
import { parseRequest } from "~/utils/request.server";
import { asyncIterableUint8ArraySchema } from "~/utils/asyncIterableUInt8Array";

const RunCommandSchema = z.object({
	command: z.string(),
	file: z.object({
		filename: z.string(),
		size: z.number(),
		data: asyncIterableUint8ArraySchema,
	}),
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

export async function action({ request }: ActionFunctionArgs) {
	const responseObject = await parseRequest<RunCommand>(request, {
		schema: RunCommandSchema,
	});

	if (responseObject.success === false) {
		console.log("::ERROR", responseObject.error.errors);
		throw new MultipartParseError("Invalid submission");
	}
	const { command, file } = responseObject.data;

	const { url, id: fileId } = await runFFmpegCommand(
		command,
		file.data,
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
