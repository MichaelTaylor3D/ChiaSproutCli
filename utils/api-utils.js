const os = require("os");
const path = require("path");
const fs = require("fs");

const { getChiaRoot } = require("./chia-root");
const { getConfig } = require("./config-loader");

const { checkChiaConfigIpHost, 
        checkFilePropagationServerReachable
      } = require("./connectivity-utils");

console.log("checkChiaConfigIpHost:", checkChiaConfigIpHost);
console.log("checkFilePropagationServerReachable:", checkFilePropagationServerReachable);

const getBaseOptions = () => {
  const CONFIG = getConfig();
  const chiaRoot = getChiaRoot();
  let cert, key;

  if (process.env.CERT_BASE64 && process.env.KEY_BASE64) {
    console.log(`Using cert and key from environment variables.`);

    cert = Buffer.from(process.env.CERT_BASE64, "base64").toString("ascii");
    key = Buffer.from(process.env.KEY_BASE64, "base64").toString("ascii");
  } else {
    let certificateFolderPath =
      CONFIG.CERTIFICATE_FOLDER_PATH || `${chiaRoot}/config/ssl`;

    // If certificateFolderPath starts with "~", replace it with the home directory
    if (certificateFolderPath.startsWith("~")) {
      certificateFolderPath = path.join(
        os.homedir(),
        certificateFolderPath.slice(1)
      );
    }

    const certFile = path.resolve(
      `${certificateFolderPath}/data_layer/private_data_layer.crt`
    );
    const keyFile = path.resolve(
      `${certificateFolderPath}/data_layer/private_data_layer.key`
    );

    cert = fs.readFileSync(certFile);
    key = fs.readFileSync(keyFile);
  }

  const baseOptions = {
    method: "POST",
    cert,
    key,
    timeout: 300000,
    CONFIG,
  };

  return baseOptions;
};

module.exports = {
  getBaseOptions
};
