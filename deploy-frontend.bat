@echo off
REM === Set your bucket and CloudFront ID below ===
set BUCKET_NAME=vyoriq-frontend
set CLOUDFRONT_ID=YOUR_CLOUDFRONT_DISTRIBUTION_ID

echo 🔨 Building the Vite frontend...
npm run build

echo 🚀 Uploading to S3 bucket: %BUCKET_NAME%
aws s3 sync dist/ s3://%BUCKET_NAME% --delete

echo ♻️ Creating CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_ID% --paths "/*"

echo ✅ Deployment complete. Check: https://vyoriq.com
pause
