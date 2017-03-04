import { Router, Response, Request } from "express";
import { config } from '../../config/config';
import { HscodeController } from '../controllers';
const passport = require('passport');

const hscode = new HscodeController();

const hscodeRouter: Router = Router();

hscodeRouter.route('')
  .get((req: Request, res: Response) => {
    hscode.list(req, res);             
  });

export { hscodeRouter };
