const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { success, error } = require('./response');

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const s3 = new S3Client({});
const TABLE = process.env.DEMOS_TABLE;
const BUCKET = process.env.FILES_BUCKET;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports.handler = async (event) => {
  try {
    const { demoId } = event.pathParameters;
    if (!demoId || !UUID_RE.test(demoId)) {
      return error('Invalid demo ID format', 400);
    }

    const claims = event.requestContext.authorizer.claims;
    const userId = claims.sub;

    // Get demo and verify ownership
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE, Key: { demoId } })
    );
    if (!existing.Item) {
      return error('Demo not found', 404);
    }
    if (existing.Item.owner.userId !== userId) {
      return error('You can only delete your own demos', 403);
    }

    // Delete associated S3 files safely
    const files = existing.Item.files || [];
    for (const file of files) {
      try {
        // Only delete files within the expected prefix
        const key = `demos/${demoId}/${file.fileName}`;
        await s3.send(
          new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
        );
      } catch (fileErr) {
        console.warn('Failed to delete file:', fileErr.message);
      }
    }

    await dynamo.send(
      new DeleteCommand({ TableName: TABLE, Key: { demoId } })
    );
    return success({ message: 'Demo deleted successfully', demoId });
  } catch (err) {
    console.error('DeleteDemo error:', err);
    return error('Failed to delete demo');
  }
};
