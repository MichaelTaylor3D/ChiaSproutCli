const gateway = require("chia-web2-gateway");
const { getConfig } = require("./utils/config-loader");

const start = () => {
  const config = getConfig();

  gateway.configure({
    DATALAYER_HOST: config.datalayer_host,
    WALLET_HOST: config.wallet_host,
    CERTIFICATE_FOLDER_PATH: config.certificate_folder_path,
    WEB2_GATEWAY_PORT: config.web2_gateway_port,
    WEB2_BIND_ADDRESS: config.web2_gateway_host,
    DEFAULT_WALLET_ID: config.default_wallet_id,
    MAXIMUM_RPC_PAYLOAD_SIZE: config.maximum_rpc_payload_size
  });

  gateway.start();
};

module.exports = {
  start
}
