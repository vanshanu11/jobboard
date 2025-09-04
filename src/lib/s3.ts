import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const useS3 = !!process.env.AWS_S3_BUCKET;

export async function uploadFile(buffer: Buffer, key: string, contentType?: string) {
  if (useS3) {
    const client = new S3Client({ region: process.env.AWS_REGION });
    const cmd = new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: contentType });
    await client.send(cmd);
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } else {
    const uploads = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
    const filePath = path.join(uploads, key);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${key}`;
  }
}
