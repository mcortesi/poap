import { Pool } from 'pg';

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

const pool = new Pool({
  host: 'localhost',
  user: 'poap',
  password: 'poap',
  database: 'poap_dev',
});

export async function getEvents() {
  const res = await pool.query('SELECT * FROM events ORDER BY start_date DESC');
  return res.rows;
}

export async function getEvent(id: number) {
  const res = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return res.rows[0];
}

// export async function insertEvent
