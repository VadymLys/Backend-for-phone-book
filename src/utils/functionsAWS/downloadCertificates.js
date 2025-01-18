import { downloadFile } from "./downloadFile.js";
import { ensureCertsDir } from "./ensureCertsDir.js";

export async function downloadCertificates(bucketName, keys) {
  await ensureCertsDir();

  try {
    const downloadPromises = keys.map((key) => downloadFile(bucketName, key));
    const filePaths = await Promise.all(downloadPromises);

    console.log("All files downloaded successfully", filePaths);
    return filePaths;
  } catch (err) {
    console.error("An error occurred during file downloads:", err);
    throw err;
  }
}
