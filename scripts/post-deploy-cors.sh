#!/bin/bash
set -e

STACK_NAME="${1:-demo-registry-stack}"
REGION="${2:-us-east-1}"

echo "🔒 Updating CORS with actual CloudFront domain..."

CF_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text)

FILES_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`FilesBucketName`].OutputValue' \
  --output text)

echo "   CloudFront URL: $CF_URL"
echo "   Files Bucket: $FILES_BUCKET"

# Update S3 CORS to use exact CloudFront domain
aws s3api put-bucket-cors \
  --bucket "$FILES_BUCKET" \
  --cors-configuration "{
    \"CORSRules\": [{
      \"AllowedOrigins\": [\"$CF_URL\"],
      \"AllowedMethods\": [\"GET\", \"PUT\"],
      \"AllowedHeaders\": [\"*\"],
      \"MaxAgeSeconds\": 3600
    }]
  }" \
  --region "$REGION"

echo "✅ CORS updated with exact CloudFront domain: $CF_URL"
