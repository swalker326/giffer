import { z } from "zod";

// Custom Zod schema for validating an AsyncIterable<Uint8Array>
export const asyncIterableUint8ArraySchema = z.custom<
	AsyncIterable<Uint8Array>
>(
	(value) => {
		if (typeof value !== "object" || value === null) {
			return false;
		}

		if (Symbol.asyncIterator in value) {
			// Type assertion for TypeScript - you can remove if not using TypeScript
			const asyncIterable = value as AsyncIterable<Uint8Array>;

			// Simple check to ensure all chunks are Uint8Array
			return (async () => {
				try {
					for await (const chunk of asyncIterable) {
						if (!(chunk instanceof Uint8Array)) {
							return false;
						}
					}
					return true;
				} catch {
					return false;
				}
			})();
		}

		return false;
	},
	{
		message: "Invalid AsyncIterable<Uint8Array>",
	},
);
