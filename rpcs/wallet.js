const superagent = require("superagent");
const { getBaseOptions } = require("../utils/api-utils");
const https = require("https");

const walletIsSynced = async () => {
  try {
    const { cert, key, timeout, CONFIG } = getBaseOptions();

    const response = await superagent
      .post(`${CONFIG.wallet_host}/get_sync_status`)
      .send({})
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = JSON.parse(response.text);

    if (data.success) {
      return data.synced;
    }

    return false;
  } catch (error) {
    return false;
  }
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
      .timeout(timeout)
      .agent(new https.Agent({ rejectUnauthorized: false }));

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
  
  if (unconfirmedTransactions) {
    await new Promise((resolve) => setTimeout(() => resolve(), 15000));
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
    .timeout(timeout)
    .agent(new https.Agent({ rejectUnauthorized: false }));

  const data = JSON.parse(response.text);

  if (data.success) {
    const unconfirmedTransactions = data.transactions.some(
      (transaction) => !transaction.confirmed
    );

    if (unconfirmedTransactions) {
      console.log("Wallet has pending transactions");
    }

    return unconfirmedTransactions;
  }

  return false;
};

module.exports = {
  hasUnconfirmedTransactions,
  walletIsSynced,
  getWalletBalance,
  waitForAllTransactionsToConfirm,
};
