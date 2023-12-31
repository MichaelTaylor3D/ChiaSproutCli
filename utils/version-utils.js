const superagent = require("superagent");
const fs = require("fs");

async function checkForNewerVersion() {
  try {
    // Read package name and version from package.json
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const packageName = packageJson.name;
    const currentVersion = packageJson.version;

    const response = await superagent.get(
      `https://registry.npmjs.org/${packageName}`
    );
    const latestVersion = response.body["dist-tags"].latest;

    if (latestVersion > currentVersion) {
      console.log(
        `A newer version (${latestVersion}) of ${packageName} is available.`
      );

      const updateCommand = `npm install -g ${packageName}`;
      console.log(`To update, run: ${updateCommand}`);
    } else {
      console.log(
        `You are using the latest version (${currentVersion}) of ${packageName}.`
      );
    }
  } catch (error) {
    console.error("Error checking for updates:", error.message);
  }
}

module.exports = {
  checkForNewerVersion,
};
