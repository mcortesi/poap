import { getDefaultProvider } from 'ethers';
import { FastifyInstance } from 'fastify';
import createError from 'http-errors';
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

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/metadata/:eventId/:tokenId', async (req, res) => {
    const event = await getEvent(parseInt(req.params.eventId));
    const tokenUrl = `http://localhost:3000/metadata/${req.params.eventId}/${req.params.tokenId}`;
    res.send(buildMetadataJson(tokenUrl, event));
  });

  fastify.get(
    '/api/ens_resolve',
    {
      schema: {
        querystring: {
          name: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const mainnetProvider = getDefaultProvider('homestead');

      if (req.query['name'] == null || req.query['name'] == '') {
        throw new createError.BadRequest('"name" query parameter is required');
      }

      const resolvedAddress = await mainnetProvider.resolveName(req.query['name']);

      if (resolvedAddress == null) {
        return {
          valid: false,
        };
      } else {
        return {
          valid: true,
          address: resolvedAddress,
        };
      }
    }
  );

  fastify.get(
    '/api/scan/:address',
    {
      schema: {
        params: {
          address: {
            type: 'string',
            minLength: 42,
            maxLength: 42,
            pattern: '^0x[0-9a-fA-F]{40}$',
          },
        },
      },
    },
    async (req, res) => {
      const address = req.params.address;
      const tokens = await getAllTokens(address);
      return tokens;
    }
  );

  fastify.get(
    '/api/token/:tokenId',
    {
      schema: {
        params: {
          tokenId: { type: 'integer' },
        },
      },
    },
    async (req, res) => {
      const tokenId = req.params.tokenId;
      const tokenInfo = await getTokenInfo(tokenId);
      return tokenInfo;
    }
  );

  fastify.get('/api/events', async (req, res) => {
    const events = await getEvents();
    return events;
  });

  fastify.get(
    '/api/events/:id',
    {
      schema: {
        params: {
          id: { type: 'integer', minimum: 1 },
        },
      },
    },
    async (req, res) => {
      const event = await getEvent(parseInt(req.params.id));
      return event;
    }
  );

  fastify.post(
    '/api/mintTokenBatch',
    {
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['eventId', 'addresses'],
          properties: {
            eventId: { type: 'integer', minimum: 1 },
            addresses: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
                minLength: 42,
                maxLength: 42,
                pattern: '^0x[0-9a-fA-F]{40}$',
              },
            },
          },
        },
      },
    },
    async (req, res) => {
      await mintTokens(req.body.eventId, req.body.addresses);
      res.status(204);
      return;
    }
  );
}
