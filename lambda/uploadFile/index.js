const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { success, error } = require('./response');

const s3 = new S3Client({});
const BUCKET = process.env.FILES_BUCKET;

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json', 'application/zip',
  'video/mp4', 'video/webm',
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_FILENAME = /^[a-zA-Z0-9._\-\s()]{1,255}$/;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { fileName, fileType, demoId } = body;

    if (!fileName || !fileType || !demoId) {
      return error('fileName, fileType, and demoId are required', 400);
    }
    if (!UUID_RE.test(demoId)) {
      return error('Invalid demo ID format', 400);
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`, 400);
    }
    if (!SAFE_FILENAME.test(fileName)) {
      return error('Invalid file name. Use only letters, numbers, dots, hyphens, underscores, spaces, and parentheses.', 400);
    }

    const sanitizedName = fileName.replace(/\s+/g, '_');
    const key = `demos/${demoId}/${Date.now()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
      ContentLength: MAX_FILE_SIZE,
      ServerSideEncryption: 'AES256',
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;

    return success({ uploadUrl, fileUrl, key });
  } catch (err) {
    console.error('UploadFile error:', err);
    return error('Failed to generate upload URL');
  }
};
