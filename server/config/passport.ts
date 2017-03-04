const passport = require('passport');
const config   = require('./config');
const path     = require('path');
import { getGlobbedFiles } from './config';
import { Jwt, local } from './strategies';
import { db } from './massive';

export function configurePassport() {
  passport.serializeUser((profile, done) => {
    console.log('serialize: ', profile);
    done(null, profile.id);
  });

  passport.deserializeUser((id, done) =>{
    db.account_profile.findOne({id: id}, (err, profile) => {
      if (err) { return done(err); }
      if (!profile) {
        done(null, false, {
          message: 'user not found'
        });
      }
      done(err, profile);
    });
  });
  
  // STRATEGIES
  Jwt();
  local();
	// // Initialize strategies
	// getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
	// 	require(path.resolve(strategy))();
	// });
}
