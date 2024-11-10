import fs from "fs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import dotenv from "dotenv";
import { certsDir } from "../constants/index.js";

dotenv.config();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

export async function downloadCertificate(bucketName, key) {
  if (!fs.existsSync(certsDir)) {
    console.error("🚀 ~ downloadCertificate ~ dirPath:", certsDir);
  }

  const filePath = path.resolve(certsDir, path.basename(key));
  const fileStream = fs.createWriteStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  try {
    const response = await s3Client.send(command);

    return new Promise((resolve, reject) => {
      response.Body.pipe(fileStream)
        .on("finish", () => {
          console.log(`Файл ${key} успішно завантажено`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Помилка при записі файлу ${key}:`, err);
          reject(err);
        });
    });
  } catch (err) {
    console.error("Помилка при завантаженні сертифіката з S3:", err);
    throw err;
  }
}
