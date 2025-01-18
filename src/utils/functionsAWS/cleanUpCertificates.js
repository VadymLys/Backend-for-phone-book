import fs from "fs/promises";
import { certsDir, isRender } from "../../constants/index.js";

export async function cleanUpCertificates() {
  if (isRender && (await fs.stat(certsDir).catch(() => false))) {
    try {
      await fs.rm(certsDir, { recursive: true, force: true });
      console.log("The Render directory has been successfully deleted.");
    } catch (err) {
      console.error("An error occurred while deleting the certificates:", err);
    }
  }
}
