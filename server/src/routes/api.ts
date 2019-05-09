import { getDefaultProvider } from 'ethers';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import createError from 'http-errors';
import * as yup from 'yup';
import { requireAuth } from '../auth';
import { getEvent, getEvents } from '../db';
import { getAllTokens, getTokenInfo, mintTokens } from '../poap-helper';
import { PoapEvent } from '../types';

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

router.get('/api/ens_resolve', async (req: Request, res: Response) => {
  const mainnetProvider = getDefaultProvider('homestead');

  if (req.query['name'] == null || req.query['name'] == '') {
    throw new createError.BadRequest('"name" query parameter is required');
  }

  const resolvedAddress = await mainnetProvider.resolveName(req.query['name']);

  if (resolvedAddress == null) {
    res.send({
      valid: false,
    });
  } else {
    res.send({
      valid: true,
      address: resolvedAddress,
    });
  }
});

router.get('/api/scan/:address', async (req: Request, res: Response) => {
  const address = req.params.address;
  const tokens = await getAllTokens(address);
  return tokens;
});

router.get('/api/token/:tokenId', async (req: Request, res: Response) => {
  const tokenId = req.params.tokenId;
  const tokenInfo = await getTokenInfo(tokenId);
  return tokenInfo;
});

router.get('/api/events', async (req: Request, res: Response) => {
  const events = await getEvents();
  return events;
});

router.get('/api/events/:id', async (req: Request, res: Response) => {
  const event = await getEvent(parseInt(req.params.id));
  return event;
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
      // throw new createError.BadRequest();
      res.status(400).send({ errors: err.errors });
      return;
    }
  }

  await mintTokens(req.body.eventId, req.body.addresses);
  return { status: 'done' };
});

export default router;
