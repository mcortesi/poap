import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { getEvents, getEvent } from '../db';
import { getAllTokens, mintTokens } from '../poap-helper';
import * as yup from 'yup';

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

const MintTokenBatchBodySchema = yup.object().shape({
  eventId: yup.number().required(),
  addresses: yup.array(yup.string()).min(1),
});

router.post('/api/mintTokenBatch', async (req: Request, res: Response) => {
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
