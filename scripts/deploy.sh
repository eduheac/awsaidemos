#!/bin/bash
set -e

STACK_NAME="${1:-demo-registry-stack}"
REGION="${2:-us-east-1}"
ENVIRONMENT="${3:-prod}"

echo "🚀 Deploying Demo Registry Stack..."
echo "   Stack: $STACK_NAME"
echo "   Region: $REGION"
echo "   Environment: $ENVIRONMENT"

# Validate template
echo "📋 Validating template..."
sam validate --template cloudformation/template.yaml --region "$REGION"

# Build Lambda functions
echo "🔨 Building Lambda functions..."
sam build --template cloudformation/template.yaml

# Deploy
echo "☁️  Deploying to AWS..."
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --region "$REGION" \
  --parameter-overrides "Environment=$ENVIRONMENT" \
  --resolve-s3 \
  --no-confirm-changeset

echo "✅ Backend deployed successfully!"
echo ""

# Print outputs
echo "📝 Stack Outputs:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
