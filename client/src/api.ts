import { authClient } from './auth';

export type Address = string;
export interface TokenInfo {
  tokenId: string;
  owner: string;
  event: PoapEvent;
}
export interface PoapEvent {
  id: number;
  fancy_id: string;
  signer: Address;
  signer_ip: string;
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

export interface Claim extends ClaimProof {
  claimerSignature: string;
}
export interface ClaimProof {
  claimId: string;
  eventId: number;
  claimer: Address;
  proof: string;
}

export type ENSQueryResult = { exists: false } | { exists: true; address: string };

const API_BASE =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api.poap.xyz';

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
  return fetchJson(`${API_BASE}/actions/ens_resolve?name=${encodeURIComponent(name)}`);
}

export function getTokensFor(address: string): Promise<TokenInfo[]> {
  return fetchJson(`${API_BASE}/actions/scan/${address}`);
}

export function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  return fetchJson(`${API_BASE}/token/${tokenId}`);
}

export async function getEvents(): Promise<PoapEvent[]> {
  return fetchJson(`${API_BASE}/events`);
}

export async function getEvent(fancyId: string): Promise<null | PoapEvent> {
  return fetchJson(`${API_BASE}/events/${fancyId}`);
}

export async function claimToken(claim: Claim): Promise<void> {
  const res = await fetch(`${API_BASE}/actions/claim`, {
    method: 'POST',
    body: JSON.stringify(claim),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    console.error(res);
    throw new Error(`Error with request statusCode: ${res.status}`);
  }
}

export async function requestProof(
  signerIp: string,
  eventId: number,
  claimer: string
): Promise<ClaimProof> {
  return fetchJson(`${signerIp}/api/proof`, {
    method: 'POST',
    body: JSON.stringify({ eventId, claimer }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function mintEventToManyUsers(eventId: number, addresses: string[]): Promise<any> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  return fetchJson(`${API_BASE}/actions/mintEventToManyUsers`, {
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
export async function mintUserToManyEvents(eventIds: number[], address: string): Promise<any> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  return fetchJson(`${API_BASE}/actions/mintUserToManyEvents`, {
    method: 'POST',
    body: JSON.stringify({
      eventIds,
      address,
    }),
    headers: {
      Authorization: bearer,
      'Content-Type': 'application/json',
    },
  });
}

export async function updateEvent(event: PoapEvent) {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  const res = await fetch(`${API_BASE}/actions/events/${event.fancy_id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
    headers: {
      Authorization: bearer,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.log(res.status);
    throw new Error();
  }
}
