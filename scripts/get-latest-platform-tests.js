"use strict";
const path = require("path");
const fs = require("fs");
const fetch = require("minipass-fetch");

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
  if (process.env.NO_UPDATE) {
    return;
  }

  for (const file of files) {
    const url = urlPrefix + file;
    const targetFile = path.resolve(__dirname, "..", "test", "web-platform-tests", file);
    const res = await fetch(url);
    res.body.pipe(fs.createWriteStream(targetFile));
  }
}

main().catch(e => {
  console.error(e.stack);
  process.exit(1);
});
