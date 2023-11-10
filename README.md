<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#quickstart">Quickstart</a></li>
    <li><a href="#compile-binary-optional">Compile Binary </a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#configuration">Configuration</a></li>
    <li><a href="#certificate-and-key-configuration">Certs. & Config</a></li>
    <li><a href="#contribution">Contribution</a></li>
  </ol>
</details>

# Sprout CLI Tool

Sprout is a command-line interface (CLI) tool designed to help manage and interact with your data layer.

## Support the Project

If you found this tool helpful, consider donating to support the development of more Chia Datalayer Tools.

**Donation address:** `xch1es9faez5evlvdyfjdjth40fazfm3c9gptds0reuhryf30y3kl67qtcsc83`

Your support is greatly appreciated!

## Disclaimer

Sprout is provided "as is", without warranty of any kind, express or implied. In no event shall the developers or contributors be liable for any claim, damages or other liability arising from, out of, or in connection with the tool or the use of the tool. The user assumes the responsibility for any loss of data that may occur due to the use of this tool.

## Prerequisites

Ensure Node.js is installed on your system to run and install Sprout.

## Quickstart

In order to use the tool, you must have Chia Wallet and Chia DataLayer running. You also need some mojos in order to cover the fees when creating datalayer transactions such as creating a new store and pushing data to the datalayer. Sprout works best when installed as a global npm package.

1. Install `chia-sprout-cli` globally by running:
   ```
   $ npm install chia-sprout-cli -g
   ```
2. Navigate to your project directory and initialize your project:
   ```
   $ sprout init
   ```
   This creates a `sprout.config.json` file in your working directory. Review the file to make sure the configuration works with your setup.
3. Create a new store:
   ```
   $ sprout store create
   ```
4. Deploy your project to datalayer:
   ```
   $ sprout deploy
   ```
5. View your files in the browser:
   ```
   $ sprout web2
   ```
   Your store will now be viewable at `https://localhost:41410/<store_id>`.

## Compile Binary (optional)

Instead of running sprout as a npm command, you can build your own binary with the following steps.

Clone the repository, navigate into the directory, and then install the required dependencies:

```bash
npm install
```

You can build the tool into an executable with one of the the following commands:

```bash
npm run create-win-x64-dist
```

```bash
npm run create-mac-x64-dist
```

```bash
npm run create-linux-x64-dist
```

```bash
npm run create-linux-arm64-dist
```

This will create an executable file named "sprout" in the build folder.

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

### `$ sprout web2`

This command starts a web2 gateway server for development purposes. When you run this you can now view the files your just deployed to the datalayer.

### `$ sprout help`

This command prints out all available commands in the console.

### `$ sprout test`

Check Chia Config IP Host (checkChiaConfigIpHost): This function is responsible for loading the Chia configuration file from ~/.chia/mainnet/config/config.yaml and verifying that the data_layer.ip_host is correctly set to either 0.0.0.0 or an empty string (but not null). It utilizes the chia-root-resolver module to accurately locate the Chia root directory. The function returns a boolean indicating whether the ip_host is correctly set.

Check File Propagation Server Reachability (checkFilePropagationServerReachable): This function determines the user's IPv4 and IPv6 addresses and sends them to a yet-to-be-built endpoint. The purpose is to check if the local file propagation server is reachable from the outside world. The function leverages a method from the chia-datalayer-mirror-tools repository to obtain the IP addresses, using publicIpv4({forceIp4: true}) for IPv4 and publicIpv4() for IPv6. The information will be sent to https://api.datalayer.storage/system/v1/check_server with a POST request, and the endpoint will return a success status.

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


<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="https://gcdnb.pbrd.co/images/tCmMiQG6nPMq.png?o=1" alt="Logo" width="150" height="80">
  </a>
   <h4>Brought to you by:</h4>
  <h3 align="center">DataLayer.Storage</h3>

  <p align="center">
    <a href="https://datalayer.storage/"><strong>Visit Now »</strong></a>
    <br />
    <br />
    <a href="https://github.com/MichaelTaylor3D/ChiaSproutCli/issues">Report Bug</a>
    ·
    <a href="https://github.com/MichaelTaylor3D/ChiaSproutCli/issues">Request Feature</a>
  </p>
</div>
</br>