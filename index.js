#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const datalayer = require("./rpcs/datalayer");
const wallet = require("./rpcs/wallet");
const { encodeHex } = require("./utils/hex-utils");
const {
  getConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
} = require("./utils/config-loader");
const { callAndAwaitBlockchainRPC } = require("./utils/chia-utils");

async function walkDirAndCreateChangeList(
  dirPath,
  storeId,
  existingKeys,
  rootDir = dirPath
) {
  const config = getConfig();
  const files = fs.readdirSync(dirPath);

  if (!existingKeys) {
    existingKeys = await callAndAwaitBlockchainRPC(
      `${config.datalayer_host}/get_keys`,
      {
        id: config.store_id,
      }
    );
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

async function run() {
  yargs(hideBin(process.argv))
    .command("deploy", "Deploy files to the datalayer", {}, async () => {
      const config = getConfig();

      if (config.store_id === null) {
        console.error(
          "The wallet is not synced, please wait for it to sync and try again"
        );
        return;
      }

      if (!(await wallet.walletIsSynced())) {
        console.error("The wallet is not synced");
        return;
      }

      if (!fs.existsSync(config.deploy_dir)) {
        console.error(
          `The directory "${config.deploy_dir}" specified in sprout.config.json does not exist`
        );
        return;
      }

      const changelist = await walkDirAndCreateChangeList(
        config.deploy_dir,
        config.store_id
      );
      console.log("Pushing files to datalayer...");

      await callAndAwaitBlockchainRPC(`${config.datalayer_host}/batch_update`, {
        changelist,
        id: config.store_id,
      });

      console.log("Done");
    })
    .command("init", "Initialize a new config file", {}, () => {
      if (fs.existsSync(CONFIG_FILENAME)) {
        console.log("The sprout.config.json file already exists");
      } else {
        fs.writeJsonSync(CONFIG_FILENAME, DEFAULT_CONFIG, { spaces: 2 });
      }
    })
    .command("create-store", "Create a new datalayer store", {}, async () => {
      const config = getConfig();

      if (config.store_id !== null) {
        console.error("A store_id already exists in sprout.config.json");
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
    })
    .command("help", "Show help", {}, () => {
      console.log(
        `Usage: sprout <command>
        
        Commands:
        deploy       Deploy files to the datalayer
        init         Initialize a new config file
        create-store Create a new datalayer store
        help         Show help`
      );
    })
    .demandCommand(1, "You need at least one command before moving on")
    .parse();
}

run();
