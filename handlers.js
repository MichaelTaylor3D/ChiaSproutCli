const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const changeListGenerator = require("chia-changelist-generator");
const wallet = require("./rpcs/wallet");
const { encodeHex } = require("./utils/hex-utils");
const Datalayer = require("chia-datalayer");
const datalayerMirror = require("chia-datalayer-mirror-tools");
const {
  getConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
} = require("./utils/config-loader");

const {
  checkChiaConfigIpHost,
  checkFilePropagationServerReachable,
} = require("./utils/connectivity-utils");
const { logInfo, logError } = require("./utils/console-tools");
const { log } = require("console");

async function generateCleanUpChangeList() {
  const config = getConfig();
  const datalayer = new Datalayer(config);
  const fileList = await datalayer.getKeys({ id: config.store_id });

  // Read the contents of the directory
  const filesInDir = await fs.readdir(config.deploy_dir);

  // Convert filenames in the directory to hexadecimal and create a set for faster lookup
  const filesInDirHex = new Set(
    filesInDir.map((fileName) => encodeHex(fileName))
  );

  // Filter out files that exist in the directory
  const filteredFileList = fileList.keys
    .filter((key) => {
      const hexKey = key.replace("0x", "");
      return !filesInDirHex.has(hexKey);
    })
    .map((key) => ({ key: key.replace("0x", "") }));

  const cleanUpChangeList = await changeListGenerator.generateChangeList(
    config.store_id,
    "delete",
    filteredFileList,
    { chunkChangeList: true }
  );

  return cleanUpChangeList;
}

async function deployHandler() {
  try {
    await checkChiaConfigIpHostHandler();
    await checkFilePropagationServerReachableHandler();

    const config = getConfig();

    if (config.store_id === null) {
      logError(
        "A store_id is not defined in sprout.config.json. Please run 'create-store' command to create a new store."
      );
      return;
    }

    if (!(await wallet.walletIsSynced())) {
      logError(
        "The wallet is not synced. Please wait for it to sync and try again."
      );
      return;
    }

    if (!fs.existsSync(config.deploy_dir)) {
      logError(
        `The directory "${config.deploy_dir}" specified in sprout.config.json does not exist. Please specify a valid directory.`
      );
      return;
    }

    changeListGenerator.configure(config);
    const datalayer = new Datalayer(config);

    const cleanUpChangeList = await generateCleanUpChangeList();

    let cleanupCounter = 1;

    logInfo("Cleaning up orphaned files.");
    for (const chunk of cleanUpChangeList) {
      logInfo(
        `Sending cleanup chunk #${cleanupCounter} of ${
          cleanUpChangeList.length
        } to datalayer. Size ${Buffer.byteLength(
          JSON.stringify(chunk),
          "utf-8"
        )}`
      );

      await datalayer.updateDataStore({
        id: config.store_id,
        changelist: _.flatten(chunk),
      });

      cleanupCounter++;
    }

    const fileList = await walkDirAndCreateFileList(
      config.deploy_dir,
      config.store_id
    );

    if (fileList.length === 0) {
      logInfo("No files to deploy.");
      return;
    }

    const chunkedChangelist = await changeListGenerator.generateChangeList(
      config.store_id,
      "insert",
      fileList,
      { chunkChangeList: true }
    );

    logInfo(
      `Pushing files to datalayer in ${chunkedChangelist.length} transaction(s).`
    );

    if (chunkedChangelist.length > 1) {
      logInfo(
        "There are multiple transactions due to the size of the changelist, this operation may take a while to complete."
      );
    }

    let chunkCounter = 1;

    // Send each chunk in separate transactions
    logInfo("Pushing new files.");
    for (const chunk of chunkedChangelist) {
      logInfo(
        `Sending chunk #${chunkCounter} of ${
          chunkedChangelist.length
        } to datalayer. Size ${Buffer.byteLength(
          JSON.stringify(chunk),
          "utf-8"
        )}`
      );

      await datalayer.updateDataStore({
        id: config.store_id,
        changelist: chunk,
      });

      chunkCounter++;
    }

    logInfo("Deploy operation completed successfully.");
  } catch (error) {
    console.trace(error);
    logError(error.message);
  } finally {
    process.exit();
  }
}

function initHandler() {
  try {
    if (fs.existsSync(CONFIG_FILENAME)) {
      logInfo(
        "A sprout.config.json file already exists in the current directory."
      );
    } else {
      fs.writeJsonSync(CONFIG_FILENAME, DEFAULT_CONFIG, { spaces: 2 });
      logInfo(
        "A new sprout.config.json file has been created with the default configuration."
      );
    }
  } catch (error) {
    logError(error.message);
  } finally {
    process.exit();
  }
}

async function mirrorStoreHandler() {
  try {
    await wallet.waitForAllTransactionsToConfirm();
    const config = getConfig();

    if (!config.store_id) {
      logError("No store_id specified in sprout.config.json");
      return;
    }

    datalayerMirror.configure(config);
    const response = await datalayerMirror.addMirrorForCurrentHost(
      config.store_id,
      config.forceIp4Mirror || false
    );

    if (response.success === false) {
      logError("Failed to add mirror");
      return;
    }

    await wallet.waitForAllTransactionsToConfirm();

    logInfo("Mirror added successfully");
  } catch (error) {
    console.trace(error);
    logError(error.message);
  } finally {
    process.exit();
  }
}

async function createStoreHandler(isNew = false) {
  try {
    const config = getConfig();

    if (!isNew && config.store_id !== null) {
      logError(
        "A store_id already exists in sprout.config.json, use the -new flag if you want to overwrite it."
      );
      return;
    }

    if (!(await wallet.walletIsSynced())) {
      logError(
        "The wallet is not synced, please wait for it to sync and try again"
      );
      return;
    }

    logInfo("Creating new store, please wait for the transaction to complete");

    const datalayer = new Datalayer(config);
    const response = await datalayer.createDataStore();

    if (!response.success) {
      logError("Failed to create new store");
      return;
    }

    const storeId = response.id;
    await wallet.waitForAllTransactionsToConfirm();

    fs.writeJsonSync(
      CONFIG_FILENAME,
      { ...config, store_id: storeId },
      { spaces: 2 }
    );

    logInfo(`Created new store with id ${storeId}`);
  } catch (error) {
    console.trace(error);
    logError(error.message);
  } finally {
    process.exit();
  }
}

async function cleanStoreHandler() {
  try {
    const config = getConfig();

    if (config.store_id === null) {
      logError("No store_id specified in sprout.config.json");
      return;
    }

    if (!(await wallet.walletIsSynced())) {
      logError("The wallet is not synced. Please sync and try again.");
      return;
    }

    const datalayer = new Datalayer(config);
    changeListGenerator.configure(config);

    const fileList = await datalayer.getKeys({ id: config.store_id });

    const chunkedChangelist = await changeListGenerator.generateChangeList(
      config.store_id,
      "delete",
      fileList.keys.map((key) => ({ key })),
      { chunkChangeList: true }
    );

    logInfo(
      `Deleting items from datalayer in ${chunkedChangelist.length} transaction(s).`
    );

    for (const chunk of chunkedChangelist) {
      await datalayer.updateDataStore({
        id: config.store_id,
        changelist: chunk,
      });
    }

    logInfo("Done deleting items from store.");
  } catch (error) {
    console.trace(error);
    logError(error.message);
  } finally {
    process.exit();
  }
}

async function walkDirAndCreateFileList(
  dirPath,
  storeId,
  existingKeys,
  rootDir = dirPath
) {
  const files = fs.readdirSync(dirPath);

  let fileList = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      const subdirChangeList = await walkDirAndCreateFileList(
        filePath,
        storeId,
        existingKeys,
        rootDir
      );
      fileList.push(...subdirChangeList);
    } else {
      const relativeFilePath = path.relative(rootDir, filePath);
      const contentBuffer = fs.readFileSync(filePath);
      const content = contentBuffer.toString("hex");

      fileList.push({
        key: encodeHex(relativeFilePath.replace(/\\/g, "/")),
        value: content,
      });
    }
  }

  return fileList;
}

async function checkChiaConfigIpHostHandler() {
  try {
    const result = await checkChiaConfigIpHost();
    console.log(`Chia Config IP Host Check: ${result}`);
    return result;
  } catch (error) {
    console.error(
      "Error in Chia Config IP Host Check. Details:",
      error.message
    );
    console.error(error.stack);
    return false;
  }
}

async function checkFilePropagationServerReachableHandler() {
  let attempts = 0;
  const maxAttempts = 3; // Retry logic, if applicable

  while (attempts < maxAttempts) {
    try {
      const result = await checkFilePropagationServerReachable();
      console.log(`File Propagation Server Reachability Check: ${result}`);
      return true;
    } catch (error) {
      attempts++;
      console.error(
        `Attempt ${attempts} - Error in File Propagation Server Reachability Check. Details:`,
        error.message
      );
      console.error(error.stack); // More detailed error logging

      if (attempts >= maxAttempts) {
        console.error("Max attempts reached. Failing gracefully.");
        return false;
      }
    }
  }
}

async function runConnectionCheckHandler() {
  try {
    const configSetup = await checkChiaConfigIpHostHandler();
    const ipVisible = await checkFilePropagationServerReachableHandler();

    if (configSetup && ipVisible) {
      logInfo(`Congrats! Your Local Mirror is Discoverable`);
    } else {
      logError(`Oh No! Your Local Mirror is Not Discoverable`);
    }
  } finally {
    process.exit();
  }
}

module.exports = {
  deployHandler,
  initHandler,
  createStoreHandler,
  cleanStoreHandler,
  checkChiaConfigIpHostHandler,
  checkFilePropagationServerReachableHandler,
  runConnectionCheckHandler,
  mirrorStoreHandler,
};
