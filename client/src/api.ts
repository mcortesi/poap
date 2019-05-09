import { authClient } from './auth';

export interface TokenInfo {
  tokenId: string;
  owner: string;
  event: PoapEvent;
}
export interface PoapEvent {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  event_url: string;
  image_url: string;
  year: number;
  start_date: Date;
  end_date: Date;
}

export type ENSQueryResult = { exists: false } | { exists: true; address: string };

const API_BASE = 'http://localhost:8080';

async function fetchJson<A>(input: RequestInfo, init?: RequestInit): Promise<A> {
  const res = await fetch(input, init);
  if (res.ok) {
    return await res.json();
  } else {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}

export function resolveENS(name: string): Promise<ENSQueryResult> {
  return fetchJson(`${API_BASE}/api/ens_resolve?name=${encodeURIComponent(name)}`);
}

export function getTokensFor(address: string): Promise<TokenInfo[]> {
  return fetchJson(`${API_BASE}/api/scan/${address}`);
}

export function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  return fetchJson(`${API_BASE}/api/token/${tokenId}`);
}

export async function getEvents(): Promise<PoapEvent[]> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  return fetchJson(`${API_BASE}/api/events`, {
    headers: {
      Authorization: bearer,
      'Content-Type': 'application/json',
    },
  });
}

export async function mintTokenBatch(eventId: number, addresses: string[]): Promise<any> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  return fetchJson(`${API_BASE}/api/mintTokenBatch`, {
    method: 'POST',
    body: JSON.stringify({
      eventId,
      addresses,
    }),
    headers: {
      Authorization: bearer,
      'Content-Type': 'application/json',
    },
  });
}
