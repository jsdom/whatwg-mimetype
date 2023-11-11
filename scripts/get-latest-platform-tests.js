"use strict";

if (process.env.NO_UPDATE) {
  process.exit(0);
}

const path = require("node:path");
const fs = require("node:fs/promises");

// Pin to specific version, reflecting the spec version in the readme.
//
// To get the latest commit:
// 1. Go to https://github.com/w3c/web-platform-tests/tree/master/mimesniff
// 2. Press "y" on your keyboard to get a permalink
// 3. Copy the commit hash
const commitHash = "ec13cf1ca3abf13ae1004003e791fd9937be0b49";

const urlPrefix = `https://raw.githubusercontent.com/w3c/web-platform-tests/${commitHash}` +
                  `/mimesniff/mime-types/resources/`;

const files = ["mime-types.json", "generated-mime-types.json"];

async function main() {
  await Promise.all(files.map(async file => {
    const url = urlPrefix + file;
    const targetFile = path.resolve(__dirname, "..", "test", "web-platform-tests", file);
    const res = await fetch(url);
    await fs.writeFile(targetFile, res.body);
  }));
}

main().catch(e => {
  console.error(e.stack);
  process.exit(1);
});
