import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

export const requireAuth = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://poapauth.auth0.com/.well-known/jwks.json',
  }),
  audience: 'poap-api',
  issuer: 'https://poapauth.auth0.com/',
  algorithms: ['RS256'],
});
