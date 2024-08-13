import { type ExecOptions, exec } from "node:child_process";

/**
 * Executes a shell command and returns a Promise that resolves with the command's output.
 * @param command - The shell command to execute.
 * @param options - Optional options for exec, e.g., cwd, env.
 * @returns Promise resolving to the command's stdout output.
 */
export function runCommand(
	command: string,
	options: ExecOptions = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		// Command safety: sanitize input and handle unsafe characters
		const safeCommand = sanitizeCommand(command);

		exec(safeCommand, options, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error: ${error.message}\n${stderr}`));
				return;
			}
			if (stderr) {
				// Handle stderr separately if needed
				reject(new Error(`stderr: ${stderr}`));
				return;
			}
			resolve(stdout);
		});
	});
}

/**
 * Sanitizes a command to avoid command injection attacks.
 * @param command - The shell command to sanitize.
 * @returns The sanitized command.
 */
function sanitizeCommand(command: string): string {
	// Implement basic command sanitization by escaping special characters.
	// Depending on the use case, you might want to use more sophisticated sanitization.
	return command.replace(/[;&|<>`]/g, "\\$&");
}
