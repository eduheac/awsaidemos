const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { success, error } = require("./response");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.DEMOS_TABLE;

exports.handler = async (event) => {
  try {
    const { demoId } = event.pathParameters;
    if (!demoId) return error("Demo ID is required", 400);
    const result = await client.send(new GetCommand({ TableName: TABLE, Key: { demoId } }));
    if (!result.Item) return error("Demo not found", 404);
    return success(result.Item);
  } catch (err) {
    console.error("GetDemo error:", err);
    return error("Failed to retrieve demo");
  }
};
