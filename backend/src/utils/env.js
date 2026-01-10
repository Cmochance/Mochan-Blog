function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`${name} is required`);
    error.status = 500;
    throw error;
  }
  return value;
}

function parseCorsOrigins(value) {
  if (!value || value.trim() === '' || value.trim() === '*') {
    return '*';
  }
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

module.exports = { getRequiredEnv, parseCorsOrigins };
