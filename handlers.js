const fs = require("fs-extra");
const path = require("path");
const changeListGenerator = require("chia-changelist-generator");
const wallet = require("./rpcs/wallet");
const { encodeHex } = require("./utils/hex-utils");
const Datalayer = require("chia-datalayer");
const {
  getConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
} = require("./utils/config-loader");
const { checkChiaConfigIpHost, 
  checkFilePropagationServerReachable
} = require("./connectivity-utils");

async function deployHandler() {
  const config = getConfig();

  if (config.store_id === null) {
    console.error(
      "A store_id is not defined in sprout.config.json. Please run 'create-store' command to create a new store."
    );
    return;
  }

  if (!(await wallet.walletIsSynced())) {
    console.error(
      "The wallet is not synced. Please wait for it to sync and try again."
    );
    return;
  }

  if (!fs.existsSync(config.deploy_dir)) {
    console.error(
      `The directory "${config.deploy_dir}" specified in sprout.config.json does not exist. Please specify a valid directory.`
    );
    return;
  }

  changeListGenerator.configure(config);

  const fileList = await walkDirAndCreateFileList(
    config.deploy_dir,
    config.store_id
  );

  const chunkedChangelist = await changeListGenerator.generateChangeList(
    config.store_id,
    "insert",
    fileList,
    { chunkChangeList: true }
  );

  console.log(
    `Pushing files to datalayer in ${chunkedChangelist.length} transaction(s).`
  );

  if (chunkedChangelist.length > 1) {
    console.log(
      "There are multiple transactions due to the size of the changelist, this operation may take a while to complete."
    );
  }

  let chunkCounter = 1;

  const datalayer = Datalayer.rpc(config);

  // Send each chunk in separate transactions
  for (const chunk of chunkedChangelist) {
    console.log(
      `Sending chunk #${chunkCounter} of ${
        chunkedChangelist.length
      } to datalayer. Size ${Buffer.byteLength(JSON.stringify(chunk), "utf-8")}`
    );

    await datalayer.updateDataStore({ id: config.store_id, changelist: chunk });

    chunkCounter++;
  }

  console.log("Deploy operation completed successfully.");
}

function initHandler() {
  if (fs.existsSync(CONFIG_FILENAME)) {
    console.log(
      "A sprout.config.json file already exists in the current directory."
    );
  } else {
    fs.writeJsonSync(CONFIG_FILENAME, DEFAULT_CONFIG, { spaces: 2 });
    console.log(
      "A new sprout.config.json file has been created with the default configuration."
    );
  }
}

async function createStoreHandler(isNew = false) {
  const config = getConfig();

  if (!isNew && config.store_id !== null) {
    console.error("A store_id already exists in sprout.config.json");
    return;
  }

  if (!(await wallet.walletIsSynced())) {
    console.error(
      "The wallet is not synced, please wait for it to sync and try again"
    );
    return;
  }

  console.log(
    "Creating new store, please wait for the transaction to complete"
  );

  const datalayer = Datalayer.rpc(config);
  const response = await datalayer.createDataStore();

  if (!response.success) {
    console.error("Failed to create new store");
    return;
  }

  const storeId = response.id;

  fs.writeJsonSync(
    CONFIG_FILENAME,
    { ...config, store_id: storeId },
    { spaces: 2 }
  );
  console.log(`Created new store with id ${storeId}`);
}

async function cleanStoreHandler() {
  const config = getConfig();

  if (config.store_id === null) {
    console.error("No store_id specified in sprout.config.json");
    return;
  }

  if (!(await wallet.walletIsSynced())) {
    console.error("The wallet is not synced. Please sync and try again.");
    return;
  }

  const datalayer = Datalayer.rpc(config);
  changeListGenerator.configure(config);

  const fileList = await datalayer.getKeys({ id: config.store_id });

  const chunkedChangelist = await changeListGenerator.generateChangeList(
    config.store_id,
    "delete",
    fileList.keys.map((key) => ({ key })),
    { chunkChangeList: true }
  );

  console.log(
    `Deleting items from datalayer in ${chunkedChangelist.length} transaction(s).`
  );

  for (const chunk of chunkedChangelist) {
    await datalayer.updateDataStore({
      id: config.store_id,
      changelist: chunk,
    });
  }

  console.log("Done deleting items from store.");
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
  } catch (error) {
      console.error('Error in Chia Config IP Host Check. Details:', error.message);
      console.error(error.stack);
      // Additional error handling logic, if applicable
  }
}

async function checkFilePropagationServerReachableHandler() {
  let attempts = 0;
  const maxAttempts = 3; // Retry logic, if applicable

  while (attempts < maxAttempts) {
      try {
          const result = await checkFilePropagationServerReachable();
          console.log(`File Propagation Server Reachability Check: ${result}`);
          break;
      } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} - Error in File Propagation Server Reachability Check. Details:`, error.message);
          console.error(error.stack); // More detailed error logging

          if (attempts >= maxAttempts) {
              console.error('Max attempts reached. Failing gracefully.');
              break;
          }
      }
  }
}


module.exports = {
  deployHandler,
  initHandler,
  createStoreHandler,
  cleanStoreHandler,
  checkChiaConfigIpHostHandler,
  checkFilePropagationServerReachableHandler
};
