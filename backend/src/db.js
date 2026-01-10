const { createClient } = require('@libsql/client');
const { getRequiredEnv } = require('./utils/env');

let client;

function getDb() {
  if (!client) {
    const url = getRequiredEnv('TURSO_DATABASE_URL');
    const authToken = process.env.TURSO_AUTH_TOKEN || '';
    client = createClient({ url, authToken });
  }

  return client;
}

module.exports = { getDb };
