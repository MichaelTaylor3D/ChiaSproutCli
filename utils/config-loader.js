const fs = require("fs-extra");

const CONFIG_FILENAME = "sprout.config.json";
const DEFAULT_CONFIG = {
  store_id: null,
  deploy_dir: "./build",
  datalayer_host: "https://localhost:8562",
  wallet_host: "https://localhost:9256",
  certificate_folder_path: "~/.chia/mainnet/config/ssl",
  default_wallet_id: 1,
  default_fee: 300_000_000,
  default_mirror_coin_amount: 300_000_000,
  maximum_rpc_payload_size: 26_214_400,
};

const getConfig = () => {
  if (!fs.existsSync(CONFIG_FILENAME)) {
    throw new Error("The sprout.config.json file does not exist");
  }
  return fs.readJsonSync(CONFIG_FILENAME);
};

module.exports = {
  getConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
};