import { Request, Response } from 'express';
import { config } from '../../config';
import { RestController, Logger, LoggerFactory, handleError
  } from '../../common';
import { Account, AccountProfile } from '../models';
import { db } from '../../config/massive';
const jwt = require('jsonwebtoken');
const passport = require('passport');

export class AuthController extends RestController {

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();
  
  /**
   * SIGNUP
   */
  signup(request: Request, response: Response) {
    this.checkRequestBodyForInputs(request, response, 
      ['first_name', 'last_name', 'email', 'password']);
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let email = request.body.email;
    let password = request.body.password;

    db.account_profile.findOne({email: email}, (err, profile) => {
      if (err) { return handleError(response, {message: err}, 500); }
      if (profile) {
        db.account.findOne({email: email}, (err, account) => {
          if (err) { return handleError(response, {message: err}, 500); }
          if (account) {
            if (this.authenticateAccount(account, password)) {
              this.returnUserToken(response, profile);
            } else {
              return this.respond(response, {message: 'incorrect password for existing account'}, 401);
            }
          } else {
            this.addAccountToProfileAndReturnToken(response, email, password, profile);
          }
        })
      } else {
        let profile = new AccountProfile({email: email, first_name: first_name, last_name: last_name});
        let validationErr = this.validateModel(response, profile);
        if (validationErr) {
          return handleError(response, validationErr, validationErr['httpStatusCode']);
        }
        db.account_profile.insert(profile, (err, account_profile) => {
          if (err) { return handleError(response, {message: err.message}, 500); }
          if (account_profile) {
            this.addAccountToProfileAndReturnToken(response, email, password, account_profile);
          }
        });
      }     
    })
  }
  private addAccountToProfileAndReturnToken(response, email, password, profile) {
    let account = new Account({
      email: email, 
      password: password
    });
    let validationErr = this.validateModel(response, account);
    if (validationErr) {
      return handleError(response, validationErr, validationErr['httpStatusCode']);
    }
    db.account.insert(account, (err, account) => {
      if (err) { return handleError(response, {message: err}, 500); }
      this.returnUserToken(response, profile);
    });
    // TASK: SEND CONFIRMATION EMAIL
  }


  /**
   * SIGNIN
   */
  signin(request: Request, response: Response) {
    let email = request.body.email;
    let password = request.body.password;
    this.checkRequestBodyForInputs(request, response, ['email', 'password']);
    db.account.findOne({email: email}, (err, account) => {
      if (err) { return handleError(response, {message: err}, 500); }
      if (account) {
        if (this.authenticateAccount(account, password)) {
          this.getProfileAndReturnToken(response, email);
        } else {
          return this.respond(response, {message: 'incorrect password'}, 401);
        }
      } else {
        // return this.respond(response, {message: 'incorrect email/password'}, 404);
        return handleError(response, {message: 'incorrect email/password'}, 401);
      }
    })
  }

  private checkRequestBodyForInputs(request: Request, response: Response, inputs: string[]) {
    inputs.forEach(input => {
      if (!request.body[input]) {
        return this.respond(response, {message: `missing ${input}`}, 400);
      }
    });
  }
  private authenticateAccount(account, password) {
    account = new Account(account);
    return account.authenticate(password);
  }
  private getProfileAndReturnToken(response, email) {
    db.account_profile.findOne({email: email}, (err, profile) => {
      if (err) { return handleError(response, {message: err}, 500); }
      if (profile) {
        this.returnUserToken(response, profile);
      }
    });
  }

  private returnUserToken(response, profile) {
    let user = {
      firstName: profile.first_name,
      lastName: profile.last_name,
      displayName: profile.display_name,
      image_url: profile.image_url,
      email: profile.email,
      roles: profile.roles
    }
    let token = 'JWT ' + jwt.sign({id: profile.id}, config.jwtSecret);
    return this.respond(response, {user: profile, token: token});
  }


  /**
   * CHECK EMAIL for existing account profile
   */
  checkAvailableEmail(request: Request, response: Response) {
    db.account_profile.findOne({email: request.body.email}, (err, profile) => {
      if (err) { return handleError(response, {message: err}, 500); }
      if (profile) {
        return this.respond(response, {message: 'email is available'});
      } else {
        return this.respond(response, {message: 'email is not available'}, 403);
      }
    })
  }


  /**
   * GET USER
   */
  getUser(request: Request, response: Response) {
    this.respond(response, request['user']);
  }

  /**
   * SIGNOUT
   */
  signout() {

  }


  /**
   * CHECK ADMIN
   */
  checkAdmin(request: Request, response: Response, next) {
    console.log('user: ', request['user']);
    if (request['user'] && request['user'].roles.indexOf('admin') !== -1) {
      next();
    } else {
      return handleError(response, {message: 'Not authorized'}, 401);
    }
  }


  /**
   * PASSWORD_RESET
   * ??
   */
  passwordReset() {

  }

  
  // /**
  //  * OAuth callback
  //  */
  // oauthCallback(strategy) {
  //   return function(req: Request, res: Response, next) {
  //     passport.authenticate(strategy, function(err, user, redirectURL) {
  //       if (err || !user) {
  //         return handleError(res, {message: err}, 401);
  //         // return res.redirect('/#!/signin');
  //       }
  //       req['login'](user, function(err) {
  //         if (err) {
  //           return handleError(res, {message: err}, 401);
  //           // return res.redirect('/#!/signin');
  //         }
  //         return res.redirect(redirectURL || '/');
  //       });
  //     })(req, res, next);
  //   };
  // };


  /**
   * SAVE OAUTH PROFILE
   * - if social account exists: 
   *    log in user by returning jwt token with account_profile
   * - if no social account but account_profile exists:
   *    add social_account to db 
   * - if no social accountand no account_profile:
   *    create a new account_profile and social account
   * 
   */
  saveOauthProfile(request, providerData, done){
    let provider = providerData.provider;
    let profile = providerData.profile;
    let identifier = providerData.providerIdentifier;
    // No signed in account_profile
    if (!request.account_profile) {
      db[`${provider}_account`]
        .findOne({
          [`${provider}_id`]: providerData.social_account[`${provider}_id`]
        }, (err, social_account) => {
        if (err) { return done(err); }
        // check if account exists,
        if (social_account) {
          this.findAccountProfileFromSocialAccount(social_account, done);
        } else {
          // check if account exists with same email
          let email = providerData.social_account.email;          
          db.account_profile.findOne({email: email}, (err, account_profile) => {
            if (err) { return done(err); }
            if (account_profile) {
              this.addNewProviderToAccountProfile(account_profile, providerData, done);
            } else {
              this.createAccountProfileAndAddSocialAccount(request, providerData, done);
            }
          });
        } // if (social_account)
      }) // db[..._account]
    } else {
      // user is already logged in, check if social account exists
      // if no social account, add provider for this account_profile
      db[`${provider}_account`]
        .findOne({email: request.account_profile.email}, 
        (err, social_account) => {
        if (err) { return done(err); }
        if (social_account) {
          return done(new Error('Account is already connected using this provider'), request.account_profile);
        } else {
          // Add new provider for this account_profile
          this.addNewProviderToAccountProfile(request.account_profile, providerData, done);
        }
      })// db
    }// if / else

  }// saveOauthProfile


  findAccountProfileFromSocialAccount(social_account, done){
    db.account_profile.findOne({
      id: social_account.account_profile_id
    }, (err, account_profile) => {
      if (err) { return done(err); }              
      return done(err, account_profile);
    });
  }

  addNewProviderToAccountProfile(account_profile, providerData, done) {
    let social_account = Object.assign({}, providerData.social_account, {
      email: account_profile.email
    });
    db[`${providerData.provider}_account`]
      .insert(social_account, (err, social_account) => {
      if (err) { return done(err); }
      return done(err, account_profile);
    });
  }
  createAccountProfileAndAddSocialAccount(request, providerData, done) {
    db.account_profile.insert(providerData.account_profile, 
    (err, account_profile) => {
      if (err) { return done(err); }
      let social_account = Object.assign({}, providerData.social_account, {
        account_profile_id: account_profile.id
      });
      db[`${providerData.provider}_account`]
        .insert(social_account, (err, social_account) => {
        if (err) { return done(err); }
        return done(err, account_profile);
      })  
    });
  } //createAccountProfileAndAddSocialAccount

} //AuthController


interface providerData {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  username: string;
  provider: string;
  profile: any;
}

/**
 * Profile format depends on provider type
 */
interface providerProfile {
  first_name: string;
  last_name: string;
  display_name: string;
}