const os = require("os");
const path = require("path");
const fs = require("fs");

const { getChiaRoot } = require("./chia-root");
const { getConfig } = require("./config-loader");

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

function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
}

function isBase64Image(str) {
  try {
    return str.startsWith("data:image");
  } catch (error) {
    return false;
  }
}

function getFileExtension(filename) {
  // Use the 'extname' method of the 'path' module to get the extension
  const ext = path.extname(filename);

  // 'ext' will be an empty string if the filename has no extension
  if (ext === "") {
    return false;
  } else {
    return ext;
  }
}

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/vnd.microsoft.icon",
  ".webp": "image/webp",
  ".tiff": "image/tiff",
  ".bmp": "image/bmp",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".md": "text/markdown",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".tar": "application/x-tar",
  ".7z": "application/x-7z-compressed",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
  // Include more MIME types as needed
};

module.exports = {
  getBaseOptions,
  isValidJSON,
  isBase64Image,
  getFileExtension,
  mimeTypes,
};