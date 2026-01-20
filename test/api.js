"use strict";
const { describe, it, test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const MIMEType = require("..");

describe("Smoke tests via README intro example", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType(`Text/HTML;Charset="utf-8"`);
  });

  it("serializes correctly", () => {
    assert.equal(mimeType.toString(), "text/html;charset=utf-8");
  });

  it("has the correct type, subtype, and essence", () => {
    assert.equal(mimeType.type, "text");
    assert.equal(mimeType.subtype, "html");
    assert.equal(mimeType.essence, "text/html");
  });

  it("has the correct parameters", () => {
    assert.equal(mimeType.parameters.size, 1);
    assert.equal(mimeType.parameters.has("charset"), true);
    assert.equal(mimeType.parameters.get("charset"), "utf-8");
  });

  it("responds to parameter setting", () => {
    mimeType.parameters.set("charset", "windows-1252");
    assert.equal(mimeType.parameters.get("charset"), "windows-1252");
    assert.equal(mimeType.toString(), "text/html;charset=windows-1252");
  });
});

describe("MIMETypeParameters object", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType(`Text/HTML;Charset="utf-8";foo="bar"`);
  });

  it("rejects setting only HTTP token code points in the name", () => {
    assert.throws(() => {
      mimeType.parameters.set("@", "a");
    });
  });

  it("rejects setting only HTTP quoted string token code points in the value", () => {
    assert.throws(() => {
      mimeType.parameters.set("a", "\u0019");
    });
  });

  it("has the correct keys, values, and entries", () => {
    assert.deepEqual(Array.from(mimeType.parameters.keys()), ["charset", "foo"]);
    assert.deepEqual(Array.from(mimeType.parameters.values()), ["utf-8", "bar"]);
    assert.deepEqual(Array.from(mimeType.parameters.entries()), [
      ["charset", "utf-8"],
      ["foo", "bar"]
    ]);
  });

  it("can be clear()ed", () => {
    mimeType.parameters.clear();

    assert.equal(mimeType.parameters.size, 0);
    assert.deepEqual(Array.from(mimeType.parameters.keys()), []);
    assert.deepEqual(Array.from(mimeType.parameters.values()), []);
    assert.deepEqual(Array.from(mimeType.parameters.entries()), []);
  });

  it("can have a parameter deleted, including by a non-canonical casing", () => {
    mimeType.parameters.delete("chArset");
    assert.equal(mimeType.parameters.size, 1);
    assert.deepEqual(Array.from(mimeType.parameters.keys()), ["foo"]);
  });

  it("can be iterated over with forEach()", () => {
    const entries = [];
    const thisArg = { this: "arg" };
    const recordedThisArgs = [];
    mimeType.parameters.forEach(function (value, name) {
      entries.push([name, value]);
      recordedThisArgs.push(this);
    }, thisArg);

    assert.deepEqual(entries, [["charset", "utf-8"], ["foo", "bar"]]);
    assert.equal(recordedThisArgs.length, 2);
    assert.equal(recordedThisArgs[0], thisArg);
    assert.equal(recordedThisArgs[1], thisArg);
  });
});

describe("Constructor behavior", () => {
  it("converts incoming arguments into strings", () => {
    const arg = {
      toString() {
        return "text/HTML";
      }
    };
    const mimeType = new MIMEType(arg);

    assert.equal(mimeType.toString(), "text/html");
  });

  it("throws on unparseable MIME types", () => {
    assert.throws(() => new MIMEType("asdf"));
    assert.throws(() => new MIMEType("text/html™"));
  });
});

describe("static parse() behavior", () => {
  it("converts incoming arguments into strings", () => {
    const arg = {
      toString() {
        return "text/HTML";
      }
    };
    const mimeType = MIMEType.parse(arg);

    assert.equal(mimeType.toString(), "text/html");
  });

  it("returns null on unparseable MIME types", () => {
    assert.equal(MIMEType.parse("asdf"), null);
    assert.equal(MIMEType.parse("text/html™"), null);
  });
});

describe("type manipulation", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType("application/xml;foo=bar");
  });

  it("responds to type being set", () => {
    mimeType.type = "text";
    assert.equal(mimeType.type, "text");
    assert.equal(mimeType.essence, "text/xml");
    assert.equal(mimeType.toString(), "text/xml;foo=bar");
  });

  it("ASCII-lowercases incoming type strings", () => {
    mimeType.type = "TeXT";
    assert.equal(mimeType.type, "text");
    assert.equal(mimeType.essence, "text/xml");
    assert.equal(mimeType.toString(), "text/xml;foo=bar");
  });

  it("converts the value set to a string", () => {
    mimeType.type = {
      toString() {
        return "TeXT";
      }
    };
    assert.equal(mimeType.type, "text");
    assert.equal(mimeType.essence, "text/xml");
    assert.equal(mimeType.toString(), "text/xml;foo=bar");
  });

  it("throws an error for non-HTTP token code points", () => {
    // not exhaustive; maybe later
    assert.throws(() => {
      mimeType.type = "/";
    });
  });

  it("throws an error for an empty string", () => {
    assert.throws(() => {
      mimeType.type = "";
    });
  });
});

describe("subtype manipulation", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType("application/xml;foo=bar");
  });

  it("responds to type being set", () => {
    mimeType.subtype = "pdf";
    assert.equal(mimeType.subtype, "pdf");
    assert.equal(mimeType.essence, "application/pdf");
    assert.equal(mimeType.toString(), "application/pdf;foo=bar");
  });

  it("ASCII-lowercases incoming type strings", () => {
    mimeType.subtype = "PdF";
    assert.equal(mimeType.subtype, "pdf");
    assert.equal(mimeType.essence, "application/pdf");
    assert.equal(mimeType.toString(), "application/pdf;foo=bar");
  });

  it("converts the value set to a string", () => {
    mimeType.subtype = {
      toString() {
        return "PdF";
      }
    };
    assert.equal(mimeType.subtype, "pdf");
    assert.equal(mimeType.essence, "application/pdf");
    assert.equal(mimeType.toString(), "application/pdf;foo=bar");
  });

  it("throws an error for non-HTTP token code points", () => {
    // not exhaustive; maybe later
    assert.throws(() => {
      mimeType.subtype = "/";
    });
  });

  it("throws an error for an empty string", () => {
    assert.throws(() => {
      mimeType.subtype = "";
    });
  });
});

describe("Group-testing functions", () => {
  test("isHTML", () => {
    assert.equal((new MIMEType("text/html")).isHTML(), true);
    assert.equal((new MIMEType("text/html;charset=utf-8")).isHTML(), true);
    assert.equal((new MIMEType("text/html;charset=utf-8;foo=bar")).isHTML(), true);

    assert.equal((new MIMEType("text/xhtml")).isHTML(), false);
    assert.equal((new MIMEType("application/html")).isHTML(), false);
    assert.equal((new MIMEType("application/xhtml+xml")).isHTML(), false);
  });

  test("isXML", () => {
    assert.equal((new MIMEType("application/xml")).isXML(), true);
    assert.equal((new MIMEType("application/xml;charset=utf-8")).isXML(), true);
    assert.equal((new MIMEType("application/xml;charset=utf-8;foo=bar")).isXML(), true);

    assert.equal((new MIMEType("text/xml")).isXML(), true);
    assert.equal((new MIMEType("text/xml;charset=utf-8")).isXML(), true);
    assert.equal((new MIMEType("text/xml;charset=utf-8;foo=bar")).isXML(), true);

    assert.equal((new MIMEType("text/svg+xml")).isXML(), true);
    assert.equal((new MIMEType("text/svg+xml;charset=utf-8")).isXML(), true);
    assert.equal((new MIMEType("text/svg+xml;charset=utf-8;foo=bar")).isXML(), true);

    assert.equal((new MIMEType("application/xhtml+xml")).isXML(), true);
    assert.equal((new MIMEType("application/xhtml+xml;charset=utf-8")).isXML(), true);
    assert.equal((new MIMEType("application/xhtml+xml;charset=utf-8;foo=bar")).isXML(), true);

    assert.equal((new MIMEType("text/xhtml")).isXML(), false);
    assert.equal((new MIMEType("text/svg")).isXML(), false);
    assert.equal((new MIMEType("application/html")).isXML(), false);
    assert.equal((new MIMEType("application/xml+xhtml")).isXML(), false);
  });

  test("isJavaScript", () => {
    for (const prohibitParameters of [false, true]) {
      assert.equal((new MIMEType("application/ecmascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("application/javascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("application/x-ecmascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("application/x-javascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/ecmascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.0")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.1")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.2")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.3")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.4")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript1.5")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/jscript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/livescript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/x-ecmascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/x-javascript")).isJavaScript({ prohibitParameters }), true);
      assert.equal((new MIMEType("text/javascript")).isJavaScript({ prohibitParameters }), true);

      assert.equal((new MIMEType("text/plain")).isJavaScript({ prohibitParameters }), false);
      assert.equal((new MIMEType("application/xhtml+xml")).isJavaScript({ prohibitParameters }), false);
      assert.equal((new MIMEType("video/javascript")).isJavaScript({ prohibitParameters }), false);
    }

    assert.equal((new MIMEType("text/plain;charset=utf-8")).isJavaScript(), false);
    assert.equal((new MIMEType("text/plain;charset=utf-8")).isJavaScript({ prohibitParameters: true }), false);

    assert.equal((new MIMEType("text/javascript;charset=utf-8")).isJavaScript(), true);
    assert.equal((new MIMEType("text/javascript;charset=utf-8")).isJavaScript({ prohibitParameters: true }), false);
    assert.equal((new MIMEType("text/javascript;charset=utf-8")).isJavaScript({}), true);
    assert.equal((new MIMEType("text/javascript;charset=utf-8")).isJavaScript({ prohibitParameters: true }), false);

    assert.equal((new MIMEType("text/javascript;charset=utf-8;goal=script")).isJavaScript(), true);
    assert.equal(
      (new MIMEType("text/javascript;charset=utf-8;goal=script")).isJavaScript({ prohibitParameters: true }),
      false
    );

    assert.equal((new MIMEType("text/javascript;goal=module")).isJavaScript(), true);
    assert.equal((new MIMEType("text/javascript;goal=module")).isJavaScript({ prohibitParameters: true }), false);
  });
});
