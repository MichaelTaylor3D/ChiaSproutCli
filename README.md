# Sprout CLI Tool

Sprout is a command-line interface (CLI) tool that helps you manage and interact with your data layer. 

If this tool was useful for you, please consider donating so I can continue building more Chia Datalayer Tools: xch1es9faez5evlvdyfjdjth40fazfm3c9gptds0reuhryf30y3kl67qtcsc83

## Prerequisites

You will need Node.js installed on your system to run and install Sprout.

## Installation

Clone the repository and navigate into the directory, then install the required dependencies:

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

### `$ sprout deploy`

Deploys the files in the directory specified in `sprout.config.json` to the data layer. It throws an error if there is no `store_id` specified in the configuration file or if `sprout.config.json` does not exist.

### `$ sprout init`

Creates a `sprout.config.json` file in the current working directory with the default JSON:

```json
{
  "store_id": null,
  "deploy_dir": "./build"
}
```

### `$ sprout create-store`

Creates a new data layer store and updates the `store_id` value in `sprout.config.json`. If there is an existing `store_id` in the configuration file, it throws an error. It also throws an error if `sprout.config.json` does not exist.

### `$ sprout help`

Prints out the available commands in the console.

## Configuration

Sprout CLI uses a configuration file (`sprout.config.json`) that specifies the data layer store ID (`store_id`) and the directory of files to be deployed (`deploy_dir`).

## Contribution

Please submit a pull request for any bug fixes or feature additions.

## License

[MIT](LICENSE)

---

Replace the `[MIT](LICENSE)` part with your actual license information. If you don't have a license yet, consider adding one. The MIT license is a simple, permissive license that is easy to understand. You can generate a license via GitHub or use online services such as https://choosealicense.com/.