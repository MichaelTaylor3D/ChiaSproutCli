const superagent = require("superagent");
const wallet = require("../rpcs/wallet");
const { getBaseOptions } = require("./api-utils");
const https = require("https");

const getFeeEstimate = async () => {
  try {
    const { cert, key, CONFIG } = getBaseOptions();

    if (!CONFIG.full_node_host) {
      return 300000000;
    }

    const response = await superagent
      .post(`${CONFIG.full_node_host}}/get_fee_estimate`)
      .send({
        target_times: [60, 120, 300],
        spend_type: "send_xch_transaction",
      })
      .set("Content-Type", "application/json")
      .key(key)
      .cert(cert)
      .agent(
        new https.Agent({
          rejectUnauthorized: false,
        })
      );

    let mojos;

    if (
      response?.body?.estimates === undefined ||
      response?.body?.estimates[0] === undefined
    ) {
      mojos = 300000000;
    } else {
      mojos = response?.body?.estimates?.[0];
    }

    // if the mojos are over 1 trillion, assume there is something wrong with the response
    // and return the default fee
    if (mojos > convertXchToMojos(1)) {
      console.log(`Current fee estimate is too high: ${mojos} mojos`);
      return 300000000;
    } else {
      console.log(`Current fee estimate: ${mojos} mojos`);
      return mojos || 300000000;
    }
  } catch {
    return 300000000;
  }
};

function chunkChangeList(array, maxSize) {
  let result = [];
  let temp = [];
  let sizeCounter = 0;

  array.forEach((item) => {
    const itemSize = Buffer.byteLength(JSON.stringify(item), "utf-8");

    // Check if single item is too big
    if (itemSize > maxSize) {
      throw new Error(
        `Item size ${itemSize} is bigger than maximum size ${maxSize}`
      );
    }

    if (sizeCounter + itemSize <= maxSize) {
      temp.push(item);
      sizeCounter += itemSize;
    } else {
      result.push(temp);
      temp = [item];
      sizeCounter = itemSize;
    }
  });

  // Push the last chunk to the result
  if (temp.length > 0) {
    result.push(temp);
  }

  return result;
}

const callAndAwaitBlockchainRPC = async (url, params, maxAttempts = 10) => {
  const { cert, key } = getBaseOptions();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await wallet.walletIsSynced();
    await wallet.waitForAllTransactionsToConfirm();

    const feeEstimate = await getFeeEstimate();
    const body = {
      ...params,
      fee: feeEstimate || 300000000,
    };

    console.log(
      `Calling Chia RPC... ${JSON.stringify({
        url
      })}`
    );

    try {
      const response = await superagent
        .post(url)
        .send(body)
        .set("Content-Type", "application/json")
        .key(key)
        .cert(cert)
        .agent(new https.Agent({ rejectUnauthorized: false }));

      if (!response.body.success) {
        throw new Error(
          `FAILED: Calling Chia RPC: ${url} ${JSON.stringify(response.body)}`
        );
      }

      await wallet.walletIsSynced();
      await wallet.waitForAllTransactionsToConfirm();

      return response.body;
    } catch (error) {
      console.log(error.message);

      if (attempt + 1 < maxAttempts) {
        console.error("Retrying...");
      } else {
        throw error;
      }
    }
  }
};

module.exports = {
  callAndAwaitBlockchainRPC,
  chunkChangeList,
};