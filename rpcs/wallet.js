const superagent = require("superagent");
const { getBaseOptions } = require("../utils/api-utils");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const walletIsSynced = async () => {
  try {
    const { cert, key, timeout, CONFIG } = getBaseOptions();

    const response = await superagent
      .post(`${CONFIG.wallet_host}/get_sync_status`)
      .send({})
      .key(key)
      .cert(cert)
      .timeout(timeout);

    const data = JSON.parse(response.text);

    if (data.success) {
      return data.synced;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const walletIsAvailable = async () => {
  return await walletIsSynced();
};

const getWalletBalance = async (options) => {
  try {
    const { cert, key, timeout, CONFIG } = getBaseOptions();

    const response = await superagent
      .post(`${CONFIG.wallet_host}/get_wallet_balance`)
      .send({
        wallet_id: options?.walletId || CONFIG.default_wallet_id,
      })
      .key(key)
      .cert(cert)
      .timeout(timeout);

    if (response.text) {
      const data = JSON.parse(response.text);
      const balance = data?.wallet_balance?.spendable_balance;
      return balance / 1000000000000;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const waitForAllTransactionsToConfirm = async () => {
  const unconfirmedTransactions = await hasUnconfirmedTransactions();
  await new Promise((resolve) => setTimeout(() => resolve(), 15000));

  if (unconfirmedTransactions) {
    return waitForAllTransactionsToConfirm();
  }

  return true;
};

const hasUnconfirmedTransactions = async (options) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();

  const response = await superagent
    .post(`${CONFIG.wallet_host}/get_transactions`)
    .send({
      wallet_id: CONFIG.default_wallet_id,
      sort_key: "RELEVANCE",
    })
    .key(key)
    .cert(cert)
    .timeout(timeout);

  const data = JSON.parse(response.text);

  if (data.success) {
    console.log("Wallet has pending transactions");

    return data.transactions.some((transaction) => !transaction.confirmed);
  }

  return false;
};

const getPublicAddress = async (options) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();

  const response = await superagent
    .post(`${CONFIG.wallet_host}/get_next_address`)
    .send({
      wallet_id: options?.walletId || CONFIG.default_wallet_id,
      new_address: options?.newAddress,
    })
    .key(key)
    .cert(cert)
    .timeout(timeout);

  const data = JSON.parse(response.text);

  if (data.success) {
    return data.address;
  }

  return false;
};

const getActiveNetwork = async () => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.wallet_host}/get_network_info`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send(JSON.stringify({}));

    const data = response.body;

    if (data.success) {
      return data;
    }

    return false;
  } catch (error) {
    return false;
  }
};

module.exports = {
  hasUnconfirmedTransactions,
  walletIsSynced,
  walletIsAvailable,
  getPublicAddress,
  getWalletBalance,
  waitForAllTransactionsToConfirm,
  getActiveNetwork,
};
