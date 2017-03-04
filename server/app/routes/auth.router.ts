import { Router, Response, Request } from "express";
import { config } from '../../config/config';
import { AuthController } from '../controllers';
const passport = require('passport');
const isLoggedIn = passport.authenticate('jwt', {session: false});
const auth = new AuthController();

const authRouter: Router = Router();

authRouter.post('/signup', (request: Request, response: Response) => {
  auth.signup(request, response);
});
authRouter.post('/signin', (request: Request, response: Response) => {
  auth.signin(request, response);
});
authRouter.route('/getUser').get(isLoggedIn, (request: Request, response: Response) => {
  auth.getUser(request, response);
});
authRouter.get('/signout', (request: any, response: Response) => {
  request.logout();
});


// authRouter.route('/password_reset')
//   .get(auth.passwordReset)
//   .post(auth.passwordReset);

export { authRouter };
