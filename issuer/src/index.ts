import * as bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import jwt from 'express-jwt';
import hbs from 'hbs';
import helmet from 'helmet';
import jwks from 'jwks-rsa';
import * as path from 'path';
import publicRouter from './routes/public';
import cors from 'cors';

const jwtCheck = jwt({
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

const VIEW_PATH = path.join(__dirname, '../views');

const app = express();

// *******************************
// Configure Express App
// *******************************

app.disable('x-powered-by');

app.set('views', VIEW_PATH);
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(VIEW_PATH, 'partials'));

// *******************************
// Configure Middlewares
// *******************************

// set well-known security-related HTTP headers
app.use(helmet());
app.use(cors({}));
app.use(compression());
app.use(express.static('public'));
app.use(jwtCheck);

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// *******************************
// Setup Routes
// *******************************

// app.use(authRouter);
// app.use(adminRouter);
app.use(publicRouter);

const server = app.listen(8080, () => console.log('Starting ExpressJS server on Port 3000'));

export default server;
