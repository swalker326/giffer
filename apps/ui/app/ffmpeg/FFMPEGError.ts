export function isFFMPEGError(error: unknown): error is FFMPEGError {
	const isFFMPEGError = error instanceof FFMPEGError;
	console.log(Object.getPrototypeOf(error));
	console.log(FFMPEGError.prototype);
	console.log("IS FFMPEG ERROR", isFFMPEGError);
	return isFFMPEGError;
}

export function isClientSideFFMPEGError(error: unknown): error is FFMPEGError {
	console.dir("ERROR BODY", error);
	console.log(
		"All Properties:",
		JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
	);
	console.log("::ERROR", error instanceof Error);
	console.log("::FFMPEG ERROR", error instanceof FFMPEGError);
	console.log("::ERROR NAME", error instanceof Error && error.name);
	return error instanceof Error && error.name === "FFMPEGError";
}
export class FFMPEGError extends Error {
	public command: string;

	constructor(message: string, command: string) {
		// Pass the message to the base Error constructor
		super(message);

		// Set the command attribute
		this.command = command;

		// Maintain proper stack trace (only works in V8 engines like Node.js)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, FFMPEGError);
		}

		// Set the name property to the class name for better error identification
		this.name = "FFMPEGError";
	}
}
