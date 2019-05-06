import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { getEvent, getEvents } from '../db';
import { secured } from '../middlewares/secured';
import { mintTokens } from '../poap-helper';

const router = Router();

router.use(secured);
router.get('/admin/', (req, res) => {
  res.render('backoffice-home');
});

router.get('/admin/issue', async (req: Request, res: Response) => {
  const events = await getEvents();
  res.render('issue', { events });
});

router.post('/admin/issue', async (req: Request, res: Response) => {
  if (!req.body || !req.body.eventId || !req.body.addressList) {
    res.status(400).send(`Invalid form: ${req.body}`);
    return;
  }

  const eventId = parseInt(req.body.eventId);
  const event = await getEvent(eventId);
  const addresses = (req.body.addressList as string).split('\n').map(x => x.trim());

  if (event == null) {
    res.status(400).send(`Invalid EventID: ${eventId}`);
    return;
  }

  await mintTokens(eventId, addresses);

  res.render('issue-success');
});

export default router;
