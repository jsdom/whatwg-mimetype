"use strict";
const encodingLabelToName = require("whatwg-encoding").labelToName;
const testCases = require("./web-platform-tests/mime-types.json");
const parse = require("../lib/parser.js");
const serialize = require("../lib/serializer.js");

for (const testCase of testCases) {
  if (typeof testCase === "string") {
    // It's a comment
    continue;
  }

  test(testCase.input, () => {
    const parsed = parse(testCase.input);

    if (testCase.output === null) {
      expect(parsed).toEqual(null);
    } else {
      const serialized = serialize(parsed);
      expect(serialized).toEqual(testCase.output);

      // See comments on data format at https://github.com/w3c/web-platform-tests/pull/7764/files#r154194211 and
      // https://github.com/w3c/web-platform-tests/pull/7764/files#r154198054.
      const charset = parsed.parameters.get("charset");
      const encoding = encodingLabelToName(charset);
      if (testCase.encoding !== "" && testCase.encoding !== undefined) {
        expect(encoding).toEqual(testCase.encoding);
      } else {
        expect(encoding).toEqual(null);
      }
    }
  });
}
