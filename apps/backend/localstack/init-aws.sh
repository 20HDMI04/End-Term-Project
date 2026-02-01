#!/bin/bash
BUCKET_NAME="book-covers"
SECONDARY_BUCKET_NAME="user-pictures"
THIRD_BUCKET_NAME="author-images"
DATA_DIR="/tmp/seed-data"


echo "Waiting 1 seconds to ensure IAM/S3 is fully ready..."
sleep 1 

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

echo "Seeding initial data into S3 buckets..."
# Uploading default images to respective buckets
awslocal s3 cp $DATA_DIR/default-book.jpg s3://book-covers/default-book.jpg --acl public-read
awslocal s3 cp $DATA_DIR/anonymous-user.webp s3://user-pictures/anonymous-user.webp --acl public-read
awslocal s3 cp $DATA_DIR/author-default.png s3://author-images/author-default.png --acl public-read

echo "S3 seeding finished successfully!"
