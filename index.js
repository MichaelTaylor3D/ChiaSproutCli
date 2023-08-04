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

async function walkAndDeployDir(dirPath, storeId) {
  const files = fs.readdirSync(dirPath);
  const existingKeys = await datalayer.getkeys(storeId);

  console.log("Existing keys", existingKeys);

  let changeList = [];

  if (existingKeys?.keys?.length > 0) {
    existingKeys.keys.forEach((key) => {
      changeList.push({
        action: "delete",
        key: key,
      });
    });
  }

  files.forEach(async (file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      await walkAndDeployDir(path.join(dirPath, file), storeId);
    } else {
      const filePath = path.join(dirPath, file);
      const contentBuffer = fs.readFileSync(filePath);
      const content = contentBuffer.toString("hex");
      changeList.push({
        action: "insert",
        key: encodeHex(file),
        value: content,
      });
    }
  });

  console.log("Pushing files to datalayer...", changeList);
  await datalayer.pushChangeListToDataLayer(storeId, changeList);
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

      await walkAndDeployDir(config.deploy_dir, config.store_id);
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
        console.error("The wallet is not synced, please wait for it to sync and try again");
        return;
      }

      const storeId = await datalayer.createDataLayerStore();
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
