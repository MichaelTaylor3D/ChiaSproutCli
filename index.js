#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const handlers = require("./handlers");

const commands = {
  deploy: {
    command: "deploy",
    desc: "Deploy files to the datalayer",
    handler: handlers.deployHandler,
  },
  init: {
    command: "init",
    desc: "Initialize a new config file",
    handler: handlers.initHandler,
  },
  store: {
    command: "store <action>",
    desc: "Manage your datalayer store",
    builder: (yargs) => {
      yargs
        .positional("action", {
          describe: "Action to perform on the store",
          type: "string",
          choices: ["create", "clean"],
        })
        .option("new", {
          alias: "n",
          description:
            "Create a new store even if a store_id already exists in the config",
          type: "boolean",
        });
    },
    handler: async (argv) => {
      if (argv.action === "create") {
        await handlers.createStoreHandler(argv.new);
      } else if (argv.action === "clean") {
        await handlers.cleanStoreHandler();
      } else {
        console.error("Unknown store action");
      }
    },
  },
};

async function run() {
  const argv = yargs(hideBin(process.argv))
    .command(commands.deploy)
    .command(commands.init)
    .command(commands.store)
    .demandCommand(1, "You need at least one command before moving on")
    .help()
    .alias("h", "help")
    .parse();
}

run();
