import { config } from "../config/index.js";
import { downloadCertificates } from "./functionsAWS/downloadCertificates.js";
import fs from "fs/promises";

export async function flagCertificates() {
  try {
    let privateKey;
    let certificate;
    let ca;
    let fullchain;

    const isAWSEnabled = config.aws.enableAWS === "true";

    if (isAWSEnabled) {
      console.log("Downloading certificates from AWS");
      const bucketName = config.aws.bucketName;

      if (
        !bucketName ||
        !config.aws.privateKeyPath ||
        !config.aws.certficatePath ||
        !config.aws.ca ||
        !config.aws.fullchainPath
      ) {
        throw new Error(
          "One or more required environment variables are missing."
        );
      }
      const [privateKeyPath, certificatePath, caPath, fullchainPath] =
        await downloadCertificates(bucketName, [
          config.aws.privateKeyPath,
          config.aws.certficatePath,
          config.aws.ca,
          config.aws.fullchainPath,
        ]);

      privateKey = await fs.readFile(privateKeyPath, "utf-8");

      certificate = await fs.readFile(certificatePath, "utf-8");

      ca = await fs.readFile(caPath, "utf-8");

      fullchain = await fs.readFile(fullchainPath, "utf-8");
    } else {
      console.log("Downloading certificates from render");

      privateKey = config.ssl.privateKey;

      certificate = config.ssl.certificate;

      ca = config.ssl.ca;

      fullchain = config.ssl.fullchain;
    }

    return {
      key: privateKey,
      cert: certificate,
      ca: ca,
      fullchain: fullchain,
    };
  } catch (err) {
    console.error(err.message);
    throw new Error("Error with certificates");
  }
}
