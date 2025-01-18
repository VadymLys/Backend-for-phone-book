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
    console.log(`File ${key} already exists, skipping download.`);
    return filePath;
  } catch (err) {
    console.log(`File ${key} not found, starting download.`);
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
          console.log(`File ${key} downloaded successfully`);
          resolve(filePath);
        })
        .on("error", (err) => {
          console.error(`Error writing file ${key}:`, err);
          reject(err);
        });
    });
  } catch (err) {
    console.error("Error downloading certificate from S3:", err);
    throw err;
  }
}
