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

const API_BASE = 'http://localhost:8080';

export async function getTokensFor(address: string): Promise<TokenInfo[]> {
  console.log('getting tokens for ', address);
  const res = await fetch(`${API_BASE}/api/tokens/${address}`);
  if (res.ok) {
    return await res.json();
  } else {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}

export async function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  console.log('Getting TokenInfo', tokenId);
  const res = await fetch(`${API_BASE}/api/token/${tokenId}`);
  if (res.ok) {
    return await res.json();
  } else {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}

export async function getEvents(): Promise<PoapEvent[]> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());

  const res = await fetch(`${API_BASE}/api/events`, {
    headers: {
      Authorization: bearer,
      'Content-Type': 'application/json',
    },
  });
  if (res.ok) {
    return await res.json();
  } else {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}

export async function mintTokenBatch(eventId: number, addresses: string[]): Promise<any> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());

  const res = await fetch(`${API_BASE}/api/mintTokenBatch`, {
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
  if (res.ok) {
    return await res.json();
  } else {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}
