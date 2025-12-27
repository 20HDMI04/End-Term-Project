#!/bin/bash
BUCKET_NAME="book-covers"
SECONDARY_BUCKET_NAME="user-pictures"
THIRD_BUCKET_NAME="author-images"

echo "Waiting 5 seconds to ensure IAM/S3 is fully ready..."
sleep 5 

# Bucket creation
echo "Creating S3 bucket: $BUCKET_NAME"
# Using awslocal inside the container
awslocal s3 mb s3://$BUCKET_NAME 2>/dev/null 

# Setting policy for the bucket
echo "Setting Public Read policy for $BUCKET_NAME"
awslocal s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy '{ "Version": "2012-10-17", "Statement": [ { "Sid": "PublicReadGetObject", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*" } ] }'

# Secondary bucket creation
echo "Creating S3 bucket: $SECONDARY_BUCKET_NAME"
awslocal s3 mb s3://$SECONDARY_BUCKET_NAME 2>/dev/null

# Setting policy for the secondary bucket
echo "Setting Public Read policy for $SECONDARY_BUCKET_NAME"
awslocal s3api put-bucket-policy \
    --bucket $SECONDARY_BUCKET_NAME \
    --policy '{ "Version": "2012-10-17", "Statement": [ { "Sid": "PublicReadGetObject", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::'"$SECONDARY_BUCKET_NAME"'/*" } ] }'

# Third bucket creation
echo "Creating S3 bucket: $THIRD_BUCKET_NAME"
awslocal s3 mb s3://$THIRD_BUCKET_NAME 2>/dev/null

# Setting policy for the third bucket
echo "Setting Public Read policy for $THIRD_BUCKET_NAME"
awslocal s3api put-bucket-policy \
    --bucket $THIRD_BUCKET_NAME \
    --policy '{ "Version": "2012-10-17", "Statement": [ { "Sid": "PublicReadGetObject", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::'"$THIRD_BUCKET_NAME"'/*" } ] }'

echo "S3 initialization complete."

echo "Waiting additional 2 seconds to ensure all operations are settled..."
sleep 2
