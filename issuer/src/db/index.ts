import { Pool } from 'pg';

export interface PoapEvent {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  eventUrl: string;
  imageUrl: string;
  year: number;
  startDate: Date;
  endDate: Date;

  metadata: Object;
  active: boolean;
}

const pool = new Pool({
  host: 'localhost',
  user: 'poap',
  password: 'poap',
  database: 'poap_dev',
});

export async function getEvents() {
  const res = await pool.query('SELECT * FROM events');
  return res.rows;
}

export async function getEvent(id: number) {
  const res = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return res.rows[0];
}

// export async function insertEvent
