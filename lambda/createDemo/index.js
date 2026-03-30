const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('./response');
const { sanitizeDemo } = require('./validate');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.DEMOS_TABLE;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const claims = event.requestContext.authorizer.claims;

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return error('Demo name is required', 400);
    }

    const sanitized = sanitizeDemo(body);
    const now = Date.now();

    const demo = {
      ...sanitized,
      demoId: uuidv4(),
      owner: {
        userId: claims.sub,
        name: claims.name || '',
        email: claims.email,
      },
      files: [],
      createdAt: now,
      updatedAt: now,
    };

    await client.send(new PutCommand({ TableName: TABLE, Item: demo }));
    return success(demo, 201);
  } catch (err) {
    console.error('CreateDemo error:', err);
    return error('Failed to create demo');
  }
};
