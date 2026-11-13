/**
 * Parse a fetch Response as JSON without blowing up on empty or non-JSON bodies.
 *
 * When the Vite dev proxy can't reach the backend it answers 502/503/504 with an
 * empty body, and `response.json()` throws "Unexpected end of JSON input". This
 * turns that into an error message that says what is actually wrong.
 */
export async function readJson<T = any>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    if (response.status >= 502 && response.status <= 504) {
      throw new Error(
        'The API server is not reachable. Start it with "npm run dev" (or "npm run dev:all") in the project root.'
      );
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Unexpected response from the server (HTTP ${response.status}).`);
  }
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
