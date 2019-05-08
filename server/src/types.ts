export type Address = string;

export interface TokenInfo {
  tokenId: string;
  tokenURI: string;
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

  metadata: Object;
  active: boolean;
}
