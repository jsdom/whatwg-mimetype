"use strict";
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

    const printableVersion = printableString(testCase.input);
    const testName = printableVersion !== testCase.input ?
      `${testCase.input} (${printableString(testCase.input)})` :
      testCase.input;

    test(testName, () => {
      const parsed = parse(testCase.input);

      if (testCase.output === null) {
        expect(parsed).toEqual(null);
      } else {
        const serialized = serialize(parsed);
        expect(serialized).toEqual(testCase.output);

        const charset = parsed.parameters.get("charset");
        const encoding = encodingLabelToName(charset);
        if (testCase.encoding !== null && testCase.encoding !== undefined) {
          expect(encoding).toEqual(testCase.encoding);
        } else {
          expect(encoding).toEqual(null);
        }
      }
    });
  }
}
