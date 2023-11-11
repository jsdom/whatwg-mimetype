"use strict";
const { describe, test } = require("node:test");
const assert = require("node:assert");
const encodingLabelToName = require("whatwg-encoding").labelToName;
const printableString = require("printable-string");
const testCases = require("./web-platform-tests/mime-types.json");
const generatedTestCases = require("./web-platform-tests/generated-mime-types.json");
const parse = require("../lib/parser.js");
const serialize = require("../lib/serializer.js");

describe("mime-types.json", () => {
  runTestCases(testCases);
});

describe("generated-mime-types.json", () => {
  runTestCases(generatedTestCases);
});

function runTestCases(cases) {
  for (const testCase of cases) {
    if (typeof testCase === "string") {
      // It's a comment
      continue;
    }

    test(printableString(testCase.input), () => {
      const parsed = parse(testCase.input);

      if (testCase.output === null) {
        assert.equal(parsed, null);
      } else {
        const serialized = serialize(parsed);
        assert.equal(serialized, testCase.output);

        const charset = parsed.parameters.get("charset");
        const encoding = encodingLabelToName(charset);
        if (testCase.encoding !== null && testCase.encoding !== undefined) {
          assert.equal(encoding, testCase.encoding);
        } else {
          assert.equal(encoding, null);
        }
      }
    });
  }
}
