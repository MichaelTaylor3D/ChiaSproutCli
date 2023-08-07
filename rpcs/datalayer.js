const superagent = require("superagent");
const wallet = require("./wallet");
const { getBaseOptions } = require("../utils/api-utils");
const https = require("https");

const getMirrors = async (storeId) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_mirrors`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({ id: storeId })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return data.mirrors;
    }

    return [];
  } catch (error) {
    return [];
  }
};

const addMirror = async (storeId, url, forceAddMirror = false) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  await wallet.waitForAllTransactionsToConfirm();

  const mirrors = await getMirrors(storeId);

  // Dont add the mirror if it already exists.
  const mirror = mirrors.find(
    (mirror) => mirror.launcher_id === storeId && mirror.urls.includes(url)
  );

  if (mirror) {
    return true;
  }

  try {
    const options = {
      id: storeId,
      urls: [url],
      amount: CONFIG.default_mirror_coin_amount,
      fee: CONFIG.default_fee,
    };

    const response = await superagent
      .post(`${CONFIG.datalayer_host}/add_mirror`)
      .key(key)
      .cert(cert)
      .send(options)
      .timeout(timeout)
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return true;
    }

    return false;
  } catch (error) {
    console.trace(error);
    return false;
  }
};

const removeMirror = async (storeId, coinId) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const mirrors = await getMirrors(storeId);

  const mirrorExists = mirrors.find(
    (mirror) => mirror.coin_id === coinId && mirror.launcher_id === storeId
  );

  if (!mirrorExists) {
    return false;
  }

  const url = `${CONFIG.datalayer_host}/delete_mirror`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        id: coinId,
        fee: CONFIG.default_fee,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const getRootDiff = async (storeId, root1, root2) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_kv_diff`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        id: storeId,
        hash_1: root1,
        hash_2: root2,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return data?.diff || [];
    }

    return [];
  } catch (error) {
    return [];
  }
};

const getRootHistory = async (storeId) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_root_history`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        id: storeId,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return data.root_history || [];
    }

    return [];
  } catch (error) {
    return [];
  }
};

const unsubscribeFromDataLayerStore = async (storeId) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/unsubscribe`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        id: storeId,
        fee: CONFIG.default_fee,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (Object.keys(data).includes("success") && data.success) {
      return data;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const dataLayerAvailable = async () => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_routes`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({})
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    // We just care that we got some response, not what the response is
    if (Object.keys(data).includes("success")) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const getStoreData = async (storeId, rootHash) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  if (storeId) {
    const payload = {
      id: storeId,
    };

    if (rootHash) {
      payload.root_hash = rootHash;
    }

    const url = `${CONFIG.datalayer_host}/get_keys_values`;

    try {
      const response = await superagent
        .post(url)
        .key(key)
        .cert(cert)
        .timeout(timeout)
        .send(payload)
        .agent(new https.Agent({ rejectUnauthorized: false }));

      const data = response.body;

      if (data.success) {
        return data;
      }
    } catch (error) {
      return false;
    }
  }

  return false;
};

const getRoot = async (storeId, ignoreEmptyStore = false) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_root`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({ id: storeId })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (
      (data.confirmed && !ignoreEmptyStore) ||
      (data.confirmed &&
        ignoreEmptyStore &&
        !data.hash.includes("0x00000000000"))
    ) {
      return data;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const getRoots = async (storeIds) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/get_roots`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({ ids: storeIds })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return data;
    }

    return [];
  } catch (error) {
    return [];
  }
};

const pushChangeListToDataLayer = async (storeId, changelist) => {
  try {
    const { cert, key, timeout, CONFIG } = getBaseOptions();
    await wallet.waitForAllTransactionsToConfirm();

    const url = `${CONFIG.datalayer_host}/batch_update`;

    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        changelist,
        id: storeId,
        fee: CONFIG.default_fee,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return true;
    }

    if (data.error.includes("Key already present")) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "There was an error pushing your changes to the datalayer",
      error
    );
  }
};

const createDataLayerStore = async () => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/create_data_store`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        fee: CONFIG.default_fee,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      console.log(data)
      return data.id;
    }

    throw new Error(data.error);
  } catch (error) {
    console.error("There was an error creating your store", error);
    throw new Error(error.message);
  }
};

const subscribeToStoreOnDataLayer = async (storeId) => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();

  if (!storeId) {
    return false;
  }

  const homeOrg = await Organization.getHomeOrg();

  if (homeOrg && [(homeOrg.orgUid, homeOrg.registryId)].includes(storeId)) {
    return { success: true };
  }

  const subscriptions = await getSubscriptions();

  if (subscriptions.includes(storeId)) {
    return { success: true };
  }

  const url = `${CONFIG.datalayer_host}/subscribe`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({
        id: storeId,
        fee: CONFIG.default_fee,
      })
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (Object.keys(data).includes("success") && data.success) {
      const chiaConfig = fullNode.getChiaConfig();

      await addMirror(
        storeId,
        `http://${await publicIpv4()}:${chiaConfig.data_layer.host_port}`
      );

      return data;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const getSubscriptions = async () => {
  const { cert, key, timeout, CONFIG } = getBaseOptions();
  const url = `${CONFIG.datalayer_host}/subscriptions`;

  try {
    const response = await superagent
      .post(url)
      .key(key)
      .cert(cert)
      .timeout(timeout)
      .send({})
      .agent(new https.Agent({ rejectUnauthorized: false }));

    const data = response.body;

    if (data.success) {
      return data.store_ids;
    }

    return [];
  } catch (error) {
    return [];
  }
};

const getValue = async ({ storeId, key, rootHash }) => {
  const { cert, key: sslKey, timeout, CONFIG } = getBaseOptions();

  if (storeId) {
    const payload = {
      id: storeId,
      key,
    };

    if (rootHash) {
      payload.root_hash = rootHash;
    }

    const url = `${CONFIG.datalayer_host}/get_value`;

    try {
      const response = await superagent
        .post(url)
        .key(sslKey)
        .cert(cert)
        .timeout(timeout)
        .send(payload)
        .agent(new https.Agent({ rejectUnauthorized: false }));

      const data = response.body;

      if (data.success) {
        return data;
      }
    } catch (error) {
      return false;
    }
  }

  return false;
};

const getkeys = async ({ storeId }) => {
  const { cert, key: sslKey, timeout, CONFIG } = getBaseOptions();

  if (storeId) {
    const payload = {
      id: storeId,
    };

    const url = `${CONFIG.datalayer_host}/get_keys`;

    try {
      const response = await superagent
        .post(url)
        .key(sslKey)
        .cert(cert)
        .timeout(timeout)
        .send(payload)
        .agent(new https.Agent({ rejectUnauthorized: false }));

      const data = response.body;

      if (data.success) {
        return data;
      }
    } catch (error) {
      return false;
    }
  }

  return false;
};

module.exports = {
  getMirrors,
  addMirror,
  removeMirror,
  getRootDiff,
  getRootHistory,
  unsubscribeFromDataLayerStore,
  dataLayerAvailable,
  getStoreData,
  getRoot,
  getRoots,
  pushChangeListToDataLayer,
  createDataLayerStore,
  subscribeToStoreOnDataLayer,
  getSubscriptions,
  getValue,
  getkeys,
};
