const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { success, error } = require('./response');
const { sanitizeString } = require('./validate');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.DEMOS_TABLE;

const MAX_LIMIT = 100;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const query = sanitizeString(body.query, 200);
    const industry = sanitizeString(body.industry, 100);
    const status = sanitizeString(body.status, 50);
    const type = sanitizeString(body.type, 20);
    const technicalLevel = sanitizeString(body.technicalLevel, 20);
    const tags = Array.isArray(body.tags)
      ? body.tags.slice(0, 10).map((t) => sanitizeString(t, 100)).filter(Boolean)
      : [];
    const awsServices = Array.isArray(body.awsServices)
      ? body.awsServices.slice(0, 10).map((s) => sanitizeString(s, 100)).filter(Boolean)
      : [];

    const filters = [];
    const names = {};
    const values = {};

    if (query) {
      filters.push('(contains(#name, :query) OR contains(businessProblem, :query) OR contains(targetAudience, :query))');
      names['#name'] = 'name';
      values[':query'] = query;
    }
    if (industry) {
      filters.push('industry = :industry');
      values[':industry'] = industry;
    }
    if (status) {
      filters.push('#status = :status');
      names['#status'] = 'status';
      values[':status'] = status;
    }
    if (type) {
      filters.push('#type = :type');
      names['#type'] = 'type';
      values[':type'] = type;
    }
    if (technicalLevel) {
      filters.push('technicalLevel = :technicalLevel');
      values[':technicalLevel'] = technicalLevel;
    }
    tags.forEach((tag, i) => {
      filters.push(`contains(tags, :tag${i})`);
      values[`:tag${i}`] = tag;
    });
    awsServices.forEach((svc, i) => {
      filters.push(`contains(awsServices, :svc${i})`);
      values[`:svc${i}`] = svc;
    });

    const limit = Math.min(Math.max(parseInt(body.limit) || 50, 1), MAX_LIMIT);
    const params = { TableName: TABLE, Limit: limit };

    if (filters.length > 0) {
      params.FilterExpression = filters.join(' AND ');
      if (Object.keys(names).length > 0) params.ExpressionAttributeNames = names;
      params.ExpressionAttributeValues = values;
    }

    const result = await client.send(new ScanCommand(params));
    return success({ items: result.Items, count: result.Count });
  } catch (err) {
    console.error('SearchDemos error:', err);
    return error('Failed to search demos');
  }
};
