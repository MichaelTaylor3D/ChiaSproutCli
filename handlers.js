const fs = require("fs-extra");
const path = require("path");
const wallet = require("./rpcs/wallet");
const { encodeHex } = require("./utils/hex-utils");
const { callAndAwaitBlockchainRPC } = require("./utils/chia-utils");
const {
  getConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
} = require("./utils/config-loader");

const changeListChunker = require("chia-changelist-chunks");

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

  const changelist = await walkDirAndCreateChangeList(
    config.deploy_dir,
    config.store_id
  );

  changeListChunker.configure(config);

  // Break up changelist into chunks due to limit in datalayer payload size
  const chunkedChangelist = await changeListChunker.chunkChangeList(
    config.store_id,
    changelist
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
  // Send each chunk in separate transactions
  for (const chunk of chunkedChangelist) {
    console.log(
      `Sending chunk #${chunkCounter} of ${
        chunkedChangelist.length
      } to datalayer. Size ${Buffer.byteLength(JSON.stringify(chunk), "utf-8")}`
    );

    await callAndAwaitBlockchainRPC(`${config.datalayer_host}/batch_update`, {
      changelist: chunk,
      id: config.store_id,
    });

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
  const response = await callAndAwaitBlockchainRPC(
    `${config.datalayer_host}/create_data_store`,
    {}
  );

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

  const changelist = await walkDirAndCreateChangeListToClearStore(
    config.deploy_dir,
    config.store_id
  );

  // Given the limit to the payload that can be sent to the datalayer,
  // break up the changelist into chunks and send them in separate transactions
  changeListChunker.configure(config);

  // Break up changelist into chunks due to limit in datalayer payload size
  const chunkedChangelist = await changeListChunker.chunkChangeList(
    config.store_id,
    changelist
  );

  console.log(
    `Deleting items from datalayer in ${chunkedChangelist.length} transaction(s).`
  );

  for (const chunk of chunkedChangelist) {
    await callAndAwaitBlockchainRPC(`${config.datalayer_host}/batch_update`, {
      changelist: chunk,
      id: config.store_id,
    });
  }

  console.log("Done deleting items from store.");
}

async function walkDirAndCreateChangeList(
  dirPath,
  storeId,
  existingKeys,
  rootDir = dirPath
) {
  const config = getConfig();
  const files = fs.readdirSync(dirPath);

  if (!existingKeys) {
    try {
      existingKeys = await callAndAwaitBlockchainRPC(
        `${config.datalayer_host}/get_keys`,
        {
          id: config.store_id,
        }
      );
    } catch {
      existingKeys = { keys: [] };
    }
  }

  let changelist = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      const subdirChangeList = await walkDirAndCreateChangeList(
        filePath,
        storeId,
        existingKeys,
        rootDir // Pass rootDir to the recursive function call
      );
      changelist.push(...subdirChangeList);
    } else {
      const relativeFilePath = path.relative(rootDir, filePath);
      const contentBuffer = fs.readFileSync(filePath);
      const content = contentBuffer.toString("hex");

      if (existingKeys?.keys?.length > 0) {
        const existingKey = existingKeys.keys.find(
          (key) => key === `0x${encodeHex(relativeFilePath)}`
        );

        if (existingKey) {
          console.log(`Updating existing key ${relativeFilePath}`);
          changelist.push({
            action: "delete",
            key: existingKey,
          });
        } else {
          console.log(`Inserting new key ${relativeFilePath}`);
        }
      }

      changelist.push({
        action: "insert",
        key: encodeHex(relativeFilePath.replace(/\\/g, "/")),
        value: content,
      });
    }
  }

  return changelist;
}

async function walkDirAndCreateChangeListToClearStore(
  dirPath,
  storeId,
  rootDir = dirPath
) {
  const files = fs.readdirSync(dirPath);
  let changelist = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      const subdirChangeList = await walkDirAndCreateChangeListToClearStore(
        filePath,
        storeId,
        rootDir // Pass rootDir to the recursive function call
      );
      changelist.push(...subdirChangeList);
    } else {
      const relativeFilePath = path.relative(rootDir, filePath);

      console.log(`Deleting Key ${relativeFilePath}`);

      changelist.push({
        action: "delete",
        key: encodeHex(relativeFilePath.replace(/\\/g, "/")),
      });
    }
  }

  return changelist;
}

module.exports = {
  deployHandler,
  initHandler,
  createStoreHandler,
  cleanStoreHandler,
};
