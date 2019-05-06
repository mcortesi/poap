import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { getEvents, getEvent } from '../db';
import { getAllTokens } from '../poap-helper';

const router = Router();

router.get('/badges', async (req: Request, res: Response) => {
  const address = req.query.address;
  const events = await getAllTokens(address);
  res.send(events);
});

router.get('/api/events', async (req: Request, res: Response) => {
  const events = await getEvents();
  res.send(events);
});

router.get('/api/events/:id', async (req: Request, res: Response) => {
  const event = await getEvent(parseInt(req.params.id));
  res.send(event);
});

router.get('/metadata/:eventId/:tokenId', async (req: Request, res: Response) => {
  const event = await getEvent(parseInt(req.params.eventId));

  res.render('metadata_json', {
    ...event,
    token_url: 'http://localhost:3000/' + req.path,
  });
  res.send(event);
});

export default router;
