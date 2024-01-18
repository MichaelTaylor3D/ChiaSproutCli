const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function createRandomFiles(directory, numberOfFiles) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  for (let i = 0; i < numberOfFiles; i++) {
    const fileName = `file_${i}.txt`;
    const filePath = path.join(directory, fileName);

    // Generate random content
    const randomContent = crypto.randomBytes(20).toString("hex");

    fs.writeFileSync(filePath, randomContent, "utf8");
  }

  console.log(`${numberOfFiles} files have been created in ${directory}`);
}

// Usage
const directoryPath = "deploy"; // Replace with your desired directory path
createRandomFiles(directoryPath, 300);
