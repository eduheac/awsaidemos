# Demo Registry - AI & GenAI Demos

Web application to register and organize AI/GenAI demos and PoCs, deployed on AWS.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS → S3 + CloudFront
- **API**: API Gateway + Lambda (Node.js 20.x) + Cognito Auth
- **Database**: DynamoDB (PAY_PER_REQUEST)
- **Storage**: S3 (presigned URLs)
- **IaC**: SAM / CloudFormation

## Prerequisites

- AWS CLI configured (`aws configure`)
- SAM CLI (`pip install aws-sam-cli`)
- Node.js 20+

## Deploy

```bash
# 1. Install Lambda dependencies
for dir in lambda/*/; do (cd "$dir" && npm install); done

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Deploy backend
./scripts/deploy.sh demo-registry-stack us-east-1 prod

# 4. Update CORS with CloudFront domain
./scripts/post-deploy-cors.sh demo-registry-stack us-east-1

# 5. Build and deploy frontend
./scripts/build-frontend.sh demo-registry-stack us-east-1
```

## Create first user

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com Name=name,Value=Name Name=email_verified,Value=true \
  --temporary-password 'TempPass123!' \
  --region us-east-1
```
