import { downloadFile } from "./downloadFile.js";
import { ensureCertsDir } from "./ensureCertsDir.js";

export async function downloadCertificates(bucketName, keys) {
  await ensureCertsDir();

  try {
    const downloadPromises = keys.map((key) => downloadFile(bucketName, key));
    const filePaths = await Promise.all(downloadPromises);

    console.log("Усі файли успішно завантажено:", filePaths);
    return filePaths;
  } catch (err) {
    console.error("Помилка при завантаженні сертифікатів:", err);
    throw err;
  }
}
