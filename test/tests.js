"use strict";
const contentTypeParser = require("..");
const assert = require("assert");

const htmlWithUTF8 = [
  "text/html;charset=utf-8",
  "Text/HTML;Charset=\"utf-8\""
];

for (const string of htmlWithUTF8) {
  describe(string, () => {
    const contentType = contentTypeParser(string);

    it("should set the properties correctly", () => {
      assert.strictEqual(contentType.type, "text");
      assert.strictEqual(contentType.subtype, "html");

      assert.strictEqual(contentType.parameterList.length, 1);
      assert.strictEqual(contentType.parameterList[0].key, "charset");
      assert.strictEqual(contentType.parameterList[0].value, "utf-8");
    });

    it("should response to the type tests correctly", () => {
      assert.strictEqual(contentType.isHTML(), true);
      assert.strictEqual(contentType.isXML(), false);
      assert.strictEqual(contentType.isText(), true);
    });

    it("should serialize correctly", () => {
      assert.strictEqual(contentType.toString(), "text/html;charset=utf-8");
    });

    it("should respond to gets correctly", () => {
      assert.strictEqual(contentType.get("charset"), "utf-8");
      assert.strictEqual(contentType.get("Charset"), "utf-8");
      assert.strictEqual(contentType.get("CHARSET"), "utf-8");

      assert.strictEqual(contentType.get("harset"), undefined);
      assert.strictEqual(contentType.get(null), undefined);
    });

    it("should respond to sets correctly", () => {
      assert.strictEqual(contentType.set("charset", "windows-1252"));
      assert.strictEqual(contentType.get("charset"), "windows-1252");

      assert.strictEqual(contentType.set("CHARSET", "UTF-8"));
      assert.strictEqual(contentType.get("charset"), "UTF-8");
    });
  });
}

describe("text/html; charset=\"utf-8\"", () => {
  const contentType = contentTypeParser("text/html; charset=\"utf-8\"");

  it("should set the properties correctly", () => {
    assert.strictEqual(contentType.type, "text");
    assert.strictEqual(contentType.subtype, "html");

    assert.strictEqual(contentType.parameterList.length, 1);
    assert.strictEqual(contentType.parameterList[0].key, "charset");
    assert.strictEqual(contentType.parameterList[0].value, "utf-8");
  });

  it("should response to the type tests correctly", () => {
    assert.strictEqual(contentType.isHTML(), true);
    assert.strictEqual(contentType.isXML(), false);
    assert.strictEqual(contentType.isText(), true);
  });

  it("should serialize correctly", () => {
    assert.strictEqual(contentType.toString(), "text/html; charset=utf-8");
  });

  it("should respond to gets correctly", () => {
    assert.strictEqual(contentType.get("charset"), "utf-8");
    assert.strictEqual(contentType.get("Charset"), "utf-8");
    assert.strictEqual(contentType.get("CHARSET"), "utf-8");

    assert.strictEqual(contentType.get("harset"), undefined);
    assert.strictEqual(contentType.get(null), undefined);
  });
});

describe("text/html;charset=UTF-8", () => {
  const contentType = contentTypeParser("text/html;charset=UTF-8");

  it("should set the properties correctly", () => {
    assert.strictEqual(contentType.type, "text");
    assert.strictEqual(contentType.subtype, "html");

    assert.strictEqual(contentType.parameterList.length, 1);
    assert.strictEqual(contentType.parameterList[0].key, "charset");
    assert.strictEqual(contentType.parameterList[0].value, "UTF-8");
  });

  it("should response to the type tests correctly", () => {
    assert.strictEqual(contentType.isHTML(), true);
    assert.strictEqual(contentType.isXML(), false);
    assert.strictEqual(contentType.isText(), true);
  });

  it("should serialize correctly", () => {
    assert.strictEqual(contentType.toString(), "text/html;charset=UTF-8");
  });

  it("should respond to gets correctly", () => {
    assert.strictEqual(contentType.get("charset"), "UTF-8");
    assert.strictEqual(contentType.get("Charset"), "UTF-8");
    assert.strictEqual(contentType.get("CHARSET"), "UTF-8");

    assert.strictEqual(contentType.get("harset"), undefined);
    assert.strictEqual(contentType.get(null), undefined);
  });
});

describe("application/xhtml+xml", () => {
  const contentType = contentTypeParser("application/xhtml+xml");

  it("should set the properties correctly", () => {
    assert.strictEqual(contentType.type, "application");
    assert.strictEqual(contentType.subtype, "xhtml+xml");

    assert.strictEqual(contentType.parameterList.length, 0);
  });

  it("should response to the type tests correctly", () => {
    assert.strictEqual(contentType.isHTML(), false);
    assert.strictEqual(contentType.isXML(), true);
    assert.strictEqual(contentType.isText(), false);
  });

  it("should serialize correctly", () => {
    assert.strictEqual(contentType.toString(), "application/xhtml+xml");
  });

  it("should respond to sets correctly", () => {
    contentType.set("charset", "utf-8");
    assert.strictEqual(contentType.get("charset"), "utf-8");
    assert.strictEqual(contentType.toString(), "application/xhtml+xml;charset=utf-8");
  });
});

const xml = [
  "application/xml",
  "text/xml",
  "foo/bar+xml"
];

for (const string of xml) {
  describe(string, () => {
    const contentType = contentTypeParser(string);

    it("should respond as XML, not HTML", () => {
      assert.strictEqual(contentType.isHTML(), false);
      assert.strictEqual(contentType.isXML(), true);
    });
  });
}

describe("foo/xml", () => {
  const contentType = contentTypeParser("foo/xml");

  it("should not respond as XML (or HTML)", () => {
    assert.strictEqual(contentType.isHTML(), false);
    assert.strictEqual(contentType.isXML(), false);
  });
});

describe("asdf", () => {
  const contentType = contentTypeParser("asdf");

  it("should be null", () => {
    assert.strictEqual(contentType, null);
  });
});
