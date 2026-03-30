#!/bin/bash
set -e

STACK_NAME="${1:-demo-registry-stack}"
REGION="${2:-us-east-1}"

echo "🏗️  Building and deploying frontend..."

# Get CloudFormation outputs
echo "📋 Fetching stack outputs..."
get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

export VITE_USER_POOL_ID=$(get_output "UserPoolId")
export VITE_USER_POOL_CLIENT_ID=$(get_output "UserPoolClientId")
export VITE_API_ENDPOINT=$(get_output "ApiEndpoint")
export VITE_FILES_BUCKET=$(get_output "FilesBucketName")
FRONTEND_BUCKET=$(get_output "FrontendBucketName")
DISTRIBUTION_ID=$(get_output "CloudFrontDistributionId")

echo "   User Pool ID: $VITE_USER_POOL_ID"
echo "   API Endpoint: $VITE_API_ENDPOINT"

# Build frontend
echo "🔨 Building React app..."
cd frontend
npm install
npm run build

# Deploy to S3
echo "☁️  Uploading to S3..."
aws s3 sync dist/ "s3://$FRONTEND_BUCKET/" --delete --region "$REGION"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --region "$REGION"

CLOUDFRONT_URL=$(get_output "CloudFrontURL")
echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 URL: $CLOUDFRONT_URL"
