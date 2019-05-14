import fastifyFactory from 'fastify';
import fastifyHelmet from 'fastify-helmet';
import fastifyCors from 'fastify-cors';

// @ts-ignore
import fastifyCompress from 'fastify-compress';

import authPlugin from './auth';
import routes from './routes';

const fastify = fastifyFactory({
  logger: true,
});

fastify.register(fastifyHelmet, {
  hidePoweredBy: true,
});

fastify.register(fastifyCors, {});
fastify.register(fastifyCompress, {});

fastify.register(authPlugin);
fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen(process.env.PORT ? parseInt(process.env.PORT) : 8080, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
