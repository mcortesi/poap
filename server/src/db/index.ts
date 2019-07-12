import { format } from 'date-fns';
import pgPromise from 'pg-promise';
import { PoapEvent, Omit } from '../types';

const db = pgPromise()({
  host: process.env.INSTANCE_CONNECTION_NAME
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    : 'localhost',
  user: process.env.SQL_USER || 'poap',
  password: process.env.SQL_PASSWORD || 'poap',
  database: process.env.SQL_DATABASE || 'poap_dev',
});

function replaceDates(event: PoapEvent): PoapEvent {
  event.start_date = format(new Date(event.start_date), 'MM/DD/YYYY');
  event.end_date = format(new Date(event.end_date), 'MM/DD/YYYY');
  return event;
}

export async function getEvents(): Promise<PoapEvent[]> {
  const res = await db.manyOrNone<PoapEvent>('SELECT * FROM events ORDER BY start_date DESC');

  return res.map(replaceDates);
}

export async function getEvent(id: number): Promise<null | PoapEvent> {
  const res = await db.oneOrNone<PoapEvent>('SELECT * FROM events WHERE id = $1', [id]);
  return res ? replaceDates(res) : res;
}

export async function getEventByFancyId(fancyid: string): Promise<null | PoapEvent> {
  const res = await db.oneOrNone<PoapEvent>('SELECT * FROM events WHERE fancy_id = $1', [fancyid]);
  return res ? replaceDates(res) : res;
}

export async function updateEvent(
  fancyId: string,
  changes: Pick<PoapEvent, 'signer' | 'signer_ip' | 'event_url' | 'image_url'>
): Promise<boolean> {
  const res = await db.result(
    'update events set signer=${signer}, signer_ip=${signer_ip}, event_url=${event_url}, image_url=${image_url} where fancy_id = ${fancy_id}',
    {
      fancy_id: fancyId,
      ...changes,
    }
  );
  return res.rowCount === 1;
}

export async function createEvent(event: Omit<PoapEvent, 'id'>): Promise<PoapEvent> {
  const data = await db.one(
    'INSERT INTO events(${this:name}) VALUES(${this:csv}) RETURNING id',
    // 'INSERT INTO events (${this:names}) VALUES (${this:list}) RETURNING id',
    event
  );

  return {
    ...event,
    id: data.id as number,
  };
}

// export async function insertEvent
