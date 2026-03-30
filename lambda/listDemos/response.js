const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cache-Control': 'no-store',
};

exports.success = (body, statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.error = (message, statusCode = 500) => ({
  statusCode,
  headers,
  body: JSON.stringify({ error: statusCode >= 500 ? 'Internal server error' : message }),
});
