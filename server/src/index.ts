import * as bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import apiRouter from './routes/api';

const app = express();

// *******************************
// Configure Express App
// *******************************

app.disable('x-powered-by');

// *******************************
// Configure Middlewares
// *******************************

// set well-known security-related HTTP headers
app.use(helmet());
app.use(cors({}));
app.use(compression());
app.use(bodyParser.json());

// *******************************
// Setup Routes
// *******************************

app.use(apiRouter);

const server = app.listen(8080, () => console.log('Starting ExpressJS server on Port 3000'));

export default server;
