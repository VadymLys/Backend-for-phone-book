import fs from "fs/promises";
import { certsDir, isRender } from "../../constants/index.js";

export async function cleanUpCertificates() {
  if (isRender && (await fs.stat(certsDir).catch(() => false))) {
    try {
      await fs.rm(certsDir, { recursive: true, force: true });
      console.log("Тимчасова директорія успішно видалена на Render");
    } catch (err) {
      console.error(
        "Помилка при видаленні тимчасової директорії на Render:",
        err
      );
    }
  }
}
