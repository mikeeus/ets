import { config } from './config';
const massive = require('massive');

const db = massive.connectSync({ connectionString: config.dbConnectionString });

export { db };
