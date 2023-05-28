const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

// Upload an object to S3
module.exports.uploadFile = async (buffer) => {
  const imageName = randomImageName();
  const uploadParams = {
    Bucket: bucketName,
    Body: buffer,
    Key: imageName,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);
  return imageName;
};

// Create a signed URL
module.exports.getUrl = async (Key) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
};

// Remove an object from S3
module.exports.deleteImage = async (Key) => {
  try {
    const deleteObjectParams = {
      Bucket: bucketName,
      Key,
    };
    const command = new DeleteObjectCommand(deleteObjectParams);
    await s3.send(command);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
