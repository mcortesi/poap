import * as bodyParser from 'body-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import hbs from 'hbs';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy } from 'passport-auth0';
import * as path from 'path';

import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';

// Load environment variables from .env
dotenv.config();

const VIEW_PATH = path.join(__dirname, '../views');

const app = express();

// Configure Passport to use Auth0
var strategy = new Strategy(
  {
    domain: process.env.AUTH0_DOMAIN!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/admin/callback',
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

// You can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// config express-session
const SESSION_OPTS = {
  secret: 'the little secret for poap',
  cookie: {} as any,
  resave: false,
  saveUninitialized: true,
};

if (app.get('env') === 'production') {
  SESSION_OPTS.cookie.secure = true; // serve secure cookies, requires https
}

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
app.use(compression());
app.use(express.static('public'));

app.use(session(SESSION_OPTS));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));

// *******************************
// Setup Routes
// *******************************

app.use(authRouter);
app.use(adminRouter);
app.use(publicRouter);

const server = app.listen(3000, () => console.log('Starting ExpressJS server on Port 3000'));

export default server;
