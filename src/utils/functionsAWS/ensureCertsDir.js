import fs from "fs/promises";
import { certsDir } from "../../constants/index.js";

export async function ensureCertsDir() {
  try {
    await fs.mkdir(certsDir, { recursive: true });
    console.log("Certificate directory created successfully:", certsDir);
  } catch (err) {
    console.error("Error creating certificate directory:", err);
  }
}
