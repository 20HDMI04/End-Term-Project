export default () => ({
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bookBucketName: process.env.S3_BOOK_COVERS_BUCKET_NAME,
    authorBucketName: process.env.S3_AUTHOR_IMAGES_BUCKET_NAME,
    profilePictureBucketName: process.env.S3_PROFILE_PICTURES_BUCKET_NAME,
  },
});
