# Project Context - AI PoC & Demo Registry

## URLs & Resources
- **App**: https://d1459bh5wbttbo.cloudfront.net
- **Repo**: https://github.com/eduheac/awsaidemos
- **API**: https://uw0u7gu6jl.execute-api.us-east-1.amazonaws.com/prod
- **Region**: us-east-1
- **Stack Name**: demo-registry-stack
- **Cognito User Pool ID**: us-east-1_9yuJx3FuS
- **Cognito Client ID**: 6oduadjf667plrujuupe90uval
- **CloudFront Distribution ID**: EF3CEPFFCI7GM
- **Files Bucket**: demo-registry-files-490447266800-prod
- **Frontend Bucket**: demo-registry-frontend-490447266800-prod

## Deploy Commands

### Backend (Lambda + API Gateway + infra)
```bash
./scripts/deploy.sh demo-registry-stack us-east-1 prod
```

### Frontend (React app)
```bash
./scripts/build-frontend.sh demo-registry-stack us-east-1
```

### Update S3 CORS (run after first backend deploy)
```bash
./scripts/post-deploy-cors.sh demo-registry-stack us-east-1
```

### Create a new user (admin only, self-signup disabled)
```bash
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_9yuJx3FuS \
  --username EMAIL \
  --user-attributes Name=email,Value=EMAIL Name=name,Value=NOMBRE Name=email_verified,Value=true \
  --temporary-password 'TempPass123!' \
  --region us-east-1
```

### Push changes to GitHub
```bash
git add .
git commit -m "description"
git push
```

## Architecture
- Frontend: React + TypeScript + Tailwind → S3 + CloudFront
- Auth: Cognito (admin-only user creation, hideSignUp)
- API: API Gateway + Cognito Authorizer + throttling
- Backend: 7 Lambda functions (Node.js 20.x)
- Database: DynamoDB (PAY_PER_REQUEST, encrypted, PITR)
- Storage: S3 with presigned URLs
- IaC: SAM / CloudFormation

## Security
- Cognito: 12-char passwords, symbols required, AdvancedSecurity ENFORCED
- CORS: restricted to CloudFront domain
- Lambda: input validation/sanitization, ownership checks on update/delete
- CloudFront: HSTS, CSP, X-Frame-Options DENY, XSS-Protection
- S3: all buckets encrypted, public access blocked
- API Gateway: throttling 100 req/s, 50 burst
- Upload: file type whitelist, 5-min presigned URLs
