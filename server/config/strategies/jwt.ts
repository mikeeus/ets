import { config } from '../config';
import { AuthController } from '../../app/controllers';
import { db } from '../massive';
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

/**
 * JWT Options
 *   issuer: the backend
 *   audience: spotini.com
 */
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.jwtSecret
};

export function Jwt() {
  passport.use(new JwtStrategy(opts, (payload, done) => {
    console.log('payload: ', payload);
    db.account_profile.findOne({id: payload.id}, (err, account_profile) => {
      if (err) { return done(err, false); }
      if (account_profile) {
        let roles = account_profile.roles;
        roles = roles.replace('{', '');
        roles = roles.replace('}', '');
        let profile = Object.assign({}, account_profile, {
          roles: roles.split(',')
        });
        return done(null, profile);
      } else {
        return done(null, false);
        // TASK: or create a new account?
      }
      
    });
  }));
}
