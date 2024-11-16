import fs from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Client.js";
import { certsDir } from "../../constants/index.js";

export async function downloadFile(bucketName, key) {
  const filePath = path.resolve(certsDir, path.basename(key));

  try {
    await fs.access(filePath);
    console.log(`Файл ${key} уже існує, пропускаємо завантаження.`);
    return filePath;
  } catch (err) {
    console.log(`Файл ${key} не знайдено, починаємо завантаження.`);
  }

  const fileStream = createWriteStream(filePath);
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
          resolve(filePath);
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
