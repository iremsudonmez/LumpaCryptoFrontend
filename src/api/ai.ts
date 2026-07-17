import { request } from './client';
import { mockApi } from './mock';
import type { AiAskResponse } from './types';

const USE_MOCK = import.meta.env.VITE_API_MODE !== 'real';

export async function askAi(question: string): Promise<AiAskResponse> {
  return USE_MOCK
    ? mockApi.askAi(question)
    : request<AiAskResponse>('/api/v1/ai/ask', {
        method: 'POST',
        body: { question },
      });
}