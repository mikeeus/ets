/**
 * Module dependencies.
 */
const passport = require('passport');
const url = require('url');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
import { AuthController } from '../../app/controllers';
import { encrypt } from '../helpers';

export function facebookStrategy() {
	const auth = new AuthController();
	// Use facebook strategy
	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			passReqToCallback: true
		},
		// TASK: encrypt access tokens when adding to database
		function(req, accessToken, refreshToken, profile, done) {
      console.log('profile: ', profile);
			// Set the provider data and include tokens
      let social_account = Object.assign({}, profile._json, {
        id: profile._json.id,
        email: profile.emails[0].value,
				access_token: encrypt(accessToken),
				refreshToken: encrypt(refreshToken)
      });
      let account_profile = {
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        display_name: profile.displayName
      }
        // username: profile.username

			// Create the user OAuth profile
			let providerData = {
				provider: 'facebook',
				providerIdentifier: 'id',
        social_account: social_account,
        account_profile: account_profile
			};

			// Save the user OAuth profile
			auth.saveOauthProfile(req, providerData, done);
		}
	));
};
