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
const commitHash = "f15f7dbb7253000494657a47360b51676fac0a0f";

const url = `https://raw.githubusercontent.com/w3c/web-platform-tests/${commitHash}` +
            `/mimesniff/mime-types/resources/mime-types.json`;

// Have to use RawGit as JSDOM.fromURL checks Content-Type header.
const targetFile = path.resolve(__dirname, "..", "test", "web-platform-tests", "mime-types.json");

request(url).pipe(fs.createWriteStream(targetFile));
