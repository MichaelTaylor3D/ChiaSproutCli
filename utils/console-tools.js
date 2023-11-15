const logInfo = (message) => {
  console.log("🌱", message);
}

const logError = (message) => {
  console.log("🔥", message);
}

module.exports = {
  logInfo,
  logError
}