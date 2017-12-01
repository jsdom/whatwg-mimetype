"use strict";
const MIMEType = require("..");

describe("README intro example", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType(`Text/HTML;Charset="utf-8"`);
  });

  it("serializes correctly", () => {
    expect(mimeType.toString()).toEqual("text/html;charset=utf-8");
  });

  it("has the correct type, subtype, and essence", () => {
    expect(mimeType.type).toEqual("text");
    expect(mimeType.subtype).toEqual("html");
    expect(mimeType.essence).toEqual("text/html");
  });

  it("has the correct parameters", () => {
    expect(mimeType.parameters.size).toEqual(1);
    expect(mimeType.parameters.has("charset")).toBe(true);
    expect(mimeType.parameters.get("charset")).toEqual("utf-8");
  });

  it("responds to parameter setting", () => {
    mimeType.parameters.set("charset", "windows-1252");
    expect(mimeType.parameters.get("charset")).toEqual("windows-1252");
    expect(mimeType.toString()).toEqual("text/html;charset=windows-1252");
  });
});

describe("type manipulation", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType("application/xml;foo=bar");
  });

  it("responds to type being set", () => {
    mimeType.type = "text";
    expect(mimeType.type).toEqual("text");
    expect(mimeType.essence).toEqual("text/xml");
    expect(mimeType.toString()).toEqual("text/xml;foo=bar");
  });

  it("ASCII-lowercases incoming type strings", () => {
    mimeType.type = "TeXT";
    expect(mimeType.type).toEqual("text");
    expect(mimeType.essence).toEqual("text/xml");
    expect(mimeType.toString()).toEqual("text/xml;foo=bar");
  });

  it("converts the value set to a string", () => {
    mimeType.type = {
      toString() {
        return "TeXT";
      }
    };
    expect(mimeType.type).toEqual("text");
    expect(mimeType.essence).toEqual("text/xml");
    expect(mimeType.toString()).toEqual("text/xml;foo=bar");
  });

  it("throws an error for non-HTTP token code points", () => {
    // not exhaustive; maybe later
    expect(() => {
      mimeType.type = "/";
    }).toThrow();
  });

  it("throws an error for an empty string", () => {
    expect(() => {
      mimeType.type = "";
    }).toThrow();
  });
});

describe("subtype manipulation", () => {
  let mimeType;
  beforeEach(() => {
    mimeType = new MIMEType("application/xml;foo=bar");
  });

  it("responds to type being set", () => {
    mimeType.subtype = "pdf";
    expect(mimeType.subtype).toEqual("pdf");
    expect(mimeType.essence).toEqual("application/pdf");
    expect(mimeType.toString()).toEqual("application/pdf;foo=bar");
  });

  it("ASCII-lowercases incoming type strings", () => {
    mimeType.subtype = "PdF";
    expect(mimeType.subtype).toEqual("pdf");
    expect(mimeType.essence).toEqual("application/pdf");
    expect(mimeType.toString()).toEqual("application/pdf;foo=bar");
  });

  it("converts the value set to a string", () => {
    mimeType.subtype = {
      toString() {
        return "PdF";
      }
    };
    expect(mimeType.subtype).toEqual("pdf");
    expect(mimeType.essence).toEqual("application/pdf");
    expect(mimeType.toString()).toEqual("application/pdf;foo=bar");
  });

  it("throws an error for non-HTTP token code points", () => {
    // not exhaustive; maybe later
    expect(() => {
      mimeType.subtype = "/";
    }).toThrow();
  });

  it("throws an error for an empty string", () => {
    expect(() => {
      mimeType.subtype = "";
    }).toThrow();
  });
});
