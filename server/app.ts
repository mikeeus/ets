import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import * as path from 'path';
import * as compression from 'compression';
import { config } from './config/config';
import { db } from './config/massive';
const cors = require('cors');
const winston = require('winston');
const passport = require('passport');

import { hscodeRouter, adminRouter, authRouter } from './app/routes';

export function configureExpress() {

  const app: express.Application = express();

  app.disable('x-powered-by');
  process.env['LOG_LEVEL'] = 'debug';

  // CORS
  const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions));
 
  if (app.get('env') === 'production') {
    // app.set('trust proxy', 1) // trust first proxy
  }
  app.use(passport.initialize());
  app.use(passport.session());
  

  app.use(json());
  app.use(compression());
  app.use(urlencoded({ extended: true }));

  // db
  app.set('db', db);

  // ROUTES
  // hscodes
  // countries
  // annual_summaries
  // search
  // home? annual, most searched records, countries?, etc.
  app.use('/api/hscodes', hscodeRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);

  // if (app.get('env') === 'production') {
  //   // in production mode run application from dist folder
  //   app.use(express.static(path.join(__dirname, '/../ang-client/dist')));
  // }

  // catch 404 and forward to error handler
  app.use(function(req: express.Request, res: express.Response, next) {
    let err = new Error('Not Found');
    next(err);
  });

  // production error handler
  // no stacktrace leaked to user
  app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {

    res.status(err.status || 500);
    res.json({
      error: {},
      message: err.message
    });
  });
  return app;
}
