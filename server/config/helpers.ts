// TOKEN ENCRYPTION WITH CTR
import { config } from './config';
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const key = config.tokenKey;

export function encrypt(text){
  var cipher = crypto.createCipher(algorithm, key)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
export function decrypt(text){
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
