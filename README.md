# Sprout CLI Tool

Sprout is a command-line interface (CLI) tool designed to help manage and interact with your data layer on the Chia Blockchain. Using this tool, you can easily deploy a directory of files to a Chia DataLayer store. 

To function correctly, Sprout requires the [Chia Blockchain](https://www.chia.net/) to be installed on your machine, as well as a running Wallet and DataLayer. 

## Prerequisites

- Ensure [Node.js](https://nodejs.org/) is installed on your system to run and install Sprout.
- The [Chia Blockchain](https://www.chia.net/) needs to be installed and set up on your machine. [Here](https://github.com/Chia-Network/chia-blockchain/wiki/INSTALL) is a guide on how to install it.
- Your Chia Wallet and DataLayer need to be running. Refer to the Chia documentation for instructions on how to start them up.

## Installation

Clone the repository, navigate into the directory, and then install the required dependencies:

```bash
npm install
```

You can build the tool into an executable with the following command:

```bash
pkg .
```

This will create an executable file named "sprout".

## Usage

The Sprout CLI tool provides the following commands:

### `$ sprout init`

This command creates a `sprout.config.json` file in the current working directory with the default JSON:

```json
{
  "store_id": null,
  "deploy_dir": "./build",
  "datalayer_host": "https://localhost:8562",
  "wallet_host": "https://localhost:9256",
  "certificate_folder_path": "~/.chia/mainnet/config/ssl",
  "default_wallet_id": 1,
  "default_fee": 300000000,
  "default_mirror_coin_amount": 300000000,
  "maximum_rpc_payload_size": 26214400
}
```

### `$ sprout deploy`

This command deploys the files in the directory specified in `sprout.config.json` to the data layer. An error will occur if there is no `store_id` specified in the configuration file or if `sprout.config.json` does not exist.

### `$ sprout store create [--new]`

This command creates a new data layer store and updates the `store_id` value in `sprout.config.json`. If an existing `store_id` is present in the configuration file, it throws an error, unless the `--new` flag is passed. An error will also occur if `sprout.config.json` does not exist. 

### `$ sprout store clean`

This command deletes all items from the current store. An error will be thrown if a `store_id` is not specified in `sprout.config.json`.

### `$ sprout help`

This command prints out all available commands in the console.

## Configuration

The Sprout CLI uses a configuration file (`sprout.config.json`) to specify various settings such as the data layer store ID (`store_id`), the directory of files to be deployed (`deploy_dir`), the data layer host (`datalayer_host`), the wallet host (`wallet_host`), the location of your certificate folder (`certificate_folder_path`), and some default values for wallet ID, fee, mirror coin amount, and RPC payload size.

### Certificate and Key Configuration

Sprout CLI supports environment variable configuration for certificate and key files necessary for communication with a remote data layer. This can be particularly useful when working in a CI pipeline. 

To provide the certificate and key as base64 strings, you can set the following environment variables:

- `CERT_BASE64`
- `KEY_BASE64`

For example:

```bash
export CERT_BASE64="your base64 encoded certificate"
export KEY_BASE64="your base64 encoded key"
```

If these environment variables are set, Sprout CLI will use these for the certificate and key. Otherwise, it will look for the files at the default location as specified in your `sprout.config.json`.

## Contribution

To contribute to this project, please submit a pull request for any bug fixes or feature additions.

## License

[MIT](LICENSE)

## Support the Project

If you found this tool helpful, consider donating to support the development of more Chia Datalayer Tools: xch1es9faez5evlvdyfjdjth40fazfm3c9gptds0reuhryf30y3kl67qtcsc83