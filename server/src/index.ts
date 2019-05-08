import * as bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import * as path from 'path';
import apiRouter from './routes/api';
import cors from 'cors';

const VIEW_PATH = path.join(__dirname, '../views');

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
