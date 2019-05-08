import { Pool } from 'pg';
import { PoapEvent } from '../types';

const pool = new Pool({
  host: 'localhost',
  user: 'poap',
  password: 'poap',
  database: 'poap_dev',
});

export async function getEvents(): Promise<PoapEvent[]> {
  const res = await pool.query('SELECT * FROM events ORDER BY start_date DESC');
  return res.rows;
}

export async function getEvent(id: number): Promise<PoapEvent> {
  const res = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return res.rows[0];
}

// export async function insertEvent
