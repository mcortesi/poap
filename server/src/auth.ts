import fp from 'fastify-plugin';
import jwksClient from 'jwks-rsa';
import fastifyJwt from 'fastify-jwt';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse
  > {
    authenticate: any;
  }
}

export default fp(
  (fastify: FastifyInstance<Server, IncomingMessage, ServerResponse>, opts, next) => {
    const client = jwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://poapauth.auth0.com/.well-known/jwks.json',
    });

    const kid = 'NjA3NjZFQjdDODI3QkEwRURDOUVEMEU1OUUwRkI3MDk5NTNEQjQ3RQ';
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        next(err);
        return;
      }

      const signingKey = key.publicKey || key.rsaPublicKey!;

      fastify.register(fastifyJwt, {
        secret: signingKey,
        verify: {
          audience: 'poap-api',
          issuer: 'https://poapauth.auth0.com/',
          algorithms: ['RS256'],
        },
      });

      fastify.decorate(
        'authenticate',
        async (request: FastifyRequest<IncomingMessage>, reply: FastifyReply<ServerResponse>) => {
          try {
            await request.jwtVerify();
          } catch (err) {
            reply.send(err);
          }
        }
      );

      next();
    });
  }
);
