async function fetchStream(endpoint: string, body?: Record<string, string>): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok || !response.body) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

export async function getDailyMotivation(): Promise<string> {
  return fetchStream('/api/motivation');
}

export async function getDadTip(category: string): Promise<string> {
  return fetchStream('/api/tip', { category });
}

export async function getWeekendIdea(category: string): Promise<string> {
  return fetchStream('/api/idea', { category });
}
