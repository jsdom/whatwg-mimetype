"use strict";

if (process.env.NO_UPDATE) {
  process.exit(0);
}

const path = require("path");
const fs = require("fs");
const request = require("request");

process.on("unhandledRejection", err => {
  throw err;
});

// Pin to specific version, reflecting the spec version in the readme.
//
// To get the latest commit:
// 1. Go to https://github.com/w3c/web-platform-tests/tree/master/mimesniff
// 2. Press "y" on your keyboard to get a permalink
// 3. Copy the commit hash
const commitHash = "e6a94100ccf5c481df3078cef5e4021769bad370";

const urlPrefix = `https://raw.githubusercontent.com/w3c/web-platform-tests/${commitHash}` +
                  `/mimesniff/mime-types/resources/`;

const files = ["mime-types.json", "generated-mime-types.json"];

for (const file of files) {
  const url = urlPrefix + file;
  const targetFile = path.resolve(__dirname, "..", "test", "web-platform-tests", file);
  request(url).pipe(fs.createWriteStream(targetFile));
}
