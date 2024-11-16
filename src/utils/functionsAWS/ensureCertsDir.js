import fs from "fs/promises";
import { certsDir } from "../../constants/index.js";

export async function ensureCertsDir() {
  try {
    await fs.mkdir(certsDir, { recursive: true });
    console.log("Директорія сертифікатів успішно створена:", certsDir);
  } catch (err) {
    console.error("Помилка створення директорії сертифікатів:", err);
  }
}
