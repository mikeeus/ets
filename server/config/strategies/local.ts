/**
 * Module dependencies.
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
import { db } from '../massive';
import { Account, AccountProfile } from '../../app/models';

export function local() {
	// Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
			db.run(`
        SELECT
          ap.id,
          first_name,
          last_name,
          display_name,
          ap.email,
          password,
          salt,
          hash_algorithm,
          ap.roles,
          image_url
        FROM account_profile AS ap
        JOIN account on ap.email = account.email
        LEFT JOIN account_profile_image AS api ON api.account_profile_id = ap.id
        WHERE ap.email = $1
      `, [email], function(err, accounts) {
				if (err) {
					return done(err);
				}
				if (!accounts[0]) {
					return done(null, false, {
						message: 'Unknown account or invalid password'
					});
				}
        if (accounts[0]) {
          let account = new Account({ 
            email: accounts[0].email,
            password: accounts[0].password,
            salt: accounts[0].salt,
            hash_algorithm: accounts[0].hash_algorithm
          });
          if (!account.authenticate(password)) {
            return done(null, false, {
              message: 'Unknown account or invalid password'
            });
          } else {
            let profile = new AccountProfile({
              id: accounts[0].id,
              first_name: accounts[0].first_name,
              last_name: accounts[0].last_name,
              display_name: accounts[0].display_name,
              email: accounts[0].email,
              roles: accounts[0].roles,
              image_url: accounts[0].image_url
            });
				    return done(null, profile);
          }
        }

			});
		}
	));
};