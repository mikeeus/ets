import { Router, Response, Request } from "express";
import { config } from '../../config/config';
import { AuthController } from '../controllers';
const passport = require('passport');

const auth = new AuthController();
const isLoggedIn = passport.authenticate('jwt', {session: false});
const isAdmin = (req: Request, res: Response, next) => {
  auth.checkAdmin(req, res, next);
}

const adminRouter: Router = Router();

// adminRouter.get("/", (request: Request, response: Response) => {
//   admin.list(request, response);
// });

// MANAGE EVENTS
// adminRouter.route("/events")
//   .post(isLoggedIn, (request: Request, response: Response) => {
//     event.create(request, response);
//   });

export { adminRouter };
