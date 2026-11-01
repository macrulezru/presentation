const DEFAULT_API_BASE = 'https://macrulez-api.ru/api';

export function resolveApiBase(explicit?: string | null): string {
  const raw = (explicit ?? '').trim().replace(/^"|"$/g, '');
  return raw || DEFAULT_API_BASE;
}

export function graphqlUrl(apiBase?: string | null): string {
  return `${resolveApiBase(apiBase)}/airlines/graphql`;
}

export async function gql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  apiBase?: string | null,
): Promise<T> {
  const res = await fetch(graphqlUrl(apiBase), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors[0]?.message);
  if (!json.data) throw new Error('Empty GraphQL response');
  return json.data;
}
