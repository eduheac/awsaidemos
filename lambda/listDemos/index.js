const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { success, error } = require('./response');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.DEMOS_TABLE;

const MAX_LIMIT = 100;

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const { industry, status, limit, nextToken } = params;

    const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), MAX_LIMIT);
    const baseParams = { TableName: TABLE, Limit: parsedLimit };

    if (nextToken) {
      try {
        const decoded = JSON.parse(
          Buffer.from(nextToken, 'base64').toString()
        );
        // Validate the pagination key structure
        if (typeof decoded === 'object' && decoded.demoId) {
          baseParams.ExclusiveStartKey = decoded;
        } else {
          return error('Invalid pagination token', 400);
        }
      } catch {
        return error('Invalid pagination token', 400);
      }
    }

    let result;
    if (industry && typeof industry === 'string') {
      result = await client.send(new QueryCommand({
        ...baseParams,
        IndexName: 'IndustryIndex',
        KeyConditionExpression: 'industry = :industry',
        ExpressionAttributeValues: { ':industry': industry.slice(0, 100) },
        ScanIndexForward: false,
      }));
    } else if (status && typeof status === 'string') {
      result = await client.send(new QueryCommand({
        ...baseParams,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#s = :status',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':status': status.slice(0, 50) },
        ScanIndexForward: false,
      }));
    } else {
      result = await client.send(new ScanCommand(baseParams));
    }

    const response = { items: result.Items, count: result.Count };
    if (result.LastEvaluatedKey) {
      response.nextToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }
    return success(response);
  } catch (err) {
    console.error('ListDemos error:', err);
    return error('Failed to list demos');
  }
};
