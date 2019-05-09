import fastifyFactory from 'fastify';
import fastifyHelmet from 'fastify-helmet';
import fastifyCors from 'fastify-cors';

// @ts-ignore
import fastifyCompress from 'fastify-compress';

import authPlugin from './auth';
import routesApi from './routes/api';

const fastify = fastifyFactory({
  logger: true,
});

fastify.register(fastifyHelmet, {
  hidePoweredBy: true,
});

fastify.register(fastifyCors, {});
fastify.register(fastifyCompress, {});

fastify.register(authPlugin);
fastify.register(routesApi);

const start = async () => {
  try {
    await fastify.listen(8080);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
