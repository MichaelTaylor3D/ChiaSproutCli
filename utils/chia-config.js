const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { getChiaRoot } = require("chia-root-resolver");

let chiaConfigMemo;

const getChiaConfig = () => {
  if (chiaConfigMemo) {
    return chiaConfigMemo;
  }

  const chiaRoot = getChiaRoot();
  const persistanceFolder = `${chiaRoot}/config`;
  const configFile = path.resolve(`${persistanceFolder}/config.yaml`);
  chiaConfigMemo = yaml.load(fs.readFileSync(configFile, "utf8"));

  return chiaConfigMemo;
};

module.exports = {
  getChiaConfig,
};
