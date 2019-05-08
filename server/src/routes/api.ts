import { Request, Response } from 'express';
import Router from 'express-promise-router';
import * as yup from 'yup';
import { requireAuth } from '../auth';
import { getEvent, getEvents, PoapEvent } from '../db';
import { getAllTokens, mintTokens } from '../poap-helper';

function buildMetadataJson(tokenUrl: string, ev: PoapEvent) {
  return {
    description: ev.description,
    external_url: tokenUrl,
    home_url: tokenUrl,
    image: ev.image_url,
    image_url: ev.image_url,
    name: ev.name,
    year: ev.year,
    tags: ['poap', 'event'],
    attributes: [
      {
        trait_type: 'startDate',
        value: ev.start_date,
      },
      {
        trait_type: 'endDate',
        value: ev.end_date,
      },
      {
        trait_type: 'city',
        value: ev.city,
      },
      {
        trait_type: 'country',
        value: ev.country,
      },
      {
        trait_type: 'eventURL',
        value: ev.event_url,
      },
    ],
    properties: [],
  };
}

const router = Router();

router.get('/metadata/:eventId/:tokenId', async (req: Request, res: Response) => {
  const event = await getEvent(parseInt(req.params.eventId));
  const tokenUrl = 'http://localhost:3000/' + req.path;
  res.send(buildMetadataJson(tokenUrl, event));
});

router.get('/api/tokens/:address', async (req: Request, res: Response) => {
  const address = req.params.address;
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

const MintTokenBatchBodySchema = yup.object().shape({
  eventId: yup.number().required(),
  addresses: yup.array(yup.string()).min(1),
});

router.post('/api/mintTokenBatch', requireAuth, async (req: Request, res: Response) => {
  try {
    await MintTokenBatchBodySchema.validate(req.body);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      res.status(400).send({ errors: err.errors });
      return;
    }
  }

  await mintTokens(req.body.eventId, req.body.addresses);
  res.status(200).send({ status: 'done' });
});

export default router;
