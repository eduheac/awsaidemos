const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { success, error } = require('./response');
const { sanitizeDemo } = require('./validate');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.DEMOS_TABLE;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_FIELDS = [
  'name', 'type', 'status', 'collaborators', 'industry', 'useCases',
  'businessProblem', 'targetAudience', 'technicalLevel', 'awsServices',
  'aiModels', 'architectureDiagram', 'codeRepo', 'demoScript', 'metrics',
  'modality', 'demoUrl', 'videoUrl', 'coverImage', 'files',
  'securityChecklist', 'tags',
];

exports.handler = async (event) => {
  try {
    const { demoId } = event.pathParameters;
    if (!demoId || !UUID_RE.test(demoId)) {
      return error('Invalid demo ID format', 400);
    }

    const body = JSON.parse(event.body || '{}');
    const claims = event.requestContext.authorizer.claims;
    const userId = claims.sub;

    // Verify demo exists and check ownership
    const existing = await client.send(
      new GetCommand({ TableName: TABLE, Key: { demoId } })
    );
    if (!existing.Item) {
      return error('Demo not found', 404);
    }
    if (existing.Item.owner.userId !== userId) {
      return error('You can only update your own demos', 403);
    }

    // Sanitize all input
    const sanitized = sanitizeDemo(body);
    const names = {};
    const values = { ':updatedAt': Date.now() };
    const expressions = ['#updatedAt = :updatedAt'];
    names['#updatedAt'] = 'updatedAt';

    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        const key = `#${field}`;
        const val = `:${field}`;
        names[key] = field;
        values[val] = sanitized[field];
        expressions.push(`${key} = ${val}`);
      }
    }

    const result = await client.send(new UpdateCommand({
      TableName: TABLE,
      Key: { demoId },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }));

    return success(result.Attributes);
  } catch (err) {
    console.error('UpdateDemo error:', err);
    return error('Failed to update demo');
  }
};
