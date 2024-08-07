// aiService.ts
import type { AIAdapter, AIAdapterResponse } from "./AIAdapter";

export class AIService {
	private adapter: AIAdapter;

	constructor(adapter: AIAdapter) {
		this.adapter = adapter;
	}

	setAdapter(adapter: AIAdapter) {
		this.adapter = adapter;
	}

	async submitPrompt(question: string): Promise<AIAdapterResponse> {
		return this.adapter.submitPrompt(question);
	}
}
