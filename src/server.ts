import express from 'express';
import compression from 'compression';
import apiLogger from './apiLogger.js';
import app from './app.js';
import bodyParser from 'body-parser';

const server = express();

server.use(compression());
server.use(apiLogger);
server.use(bodyParser.json());
server.use(app);
app.use((req, res) => {
  return res.sendStatus(404);
});

export default server;