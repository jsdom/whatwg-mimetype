"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { MIMEType, computedMIMEType } = require("..");

// Try to import Node.js built-in MIMEType (available in Node v22+)
let NodeMIMEType = null;
try {
  NodeMIMEType = require("node:util").MIMEType;
} catch {
  // Not available in this Node version
}

// Helper to create Uint8Array from byte values
function bytes(...values) {
  return new Uint8Array(values);
}

// Helper to create Uint8Array from string
function stringBytes(str) {
  return new TextEncoder().encode(str);
}

describe("image sniffing", () => {
  it("should detect PNG", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png).essence, "image/png");
  });

  it("should detect JPEG", () => {
    const jpeg = bytes(0xFF, 0xD8, 0xFF);
    assert.equal(computedMIMEType(jpeg).essence, "image/jpeg");
  });

  it("should detect GIF87a", () => {
    const gif = bytes(0x47, 0x49, 0x46, 0x38, 0x37, 0x61);
    assert.equal(computedMIMEType(gif).essence, "image/gif");
  });

  it("should detect GIF89a", () => {
    const gif = bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
    assert.equal(computedMIMEType(gif).essence, "image/gif");
  });

  it("should detect BMP", () => {
    const bmp = bytes(0x42, 0x4D);
    assert.equal(computedMIMEType(bmp).essence, "image/bmp");
  });

  it("should detect ICO", () => {
    const ico = bytes(0x00, 0x00, 0x01, 0x00);
    assert.equal(computedMIMEType(ico).essence, "image/x-icon");
  });
});

describe("audio/video sniffing", () => {
  it("should detect MP3 with ID3", () => {
    const mp3 = bytes(0x49, 0x44, 0x33);
    assert.equal(computedMIMEType(mp3).essence, "audio/mpeg");
  });

  it("should detect OGG", () => {
    const ogg = bytes(0x4F, 0x67, 0x67, 0x53, 0x00);
    assert.equal(computedMIMEType(ogg).essence, "application/ogg");
  });

  it("should detect MIDI", () => {
    const midi = bytes(0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06);
    assert.equal(computedMIMEType(midi).essence, "audio/midi");
  });
});

describe("archive sniffing", () => {
  it("should detect ZIP", () => {
    const zip = bytes(0x50, 0x4B, 0x03, 0x04);
    assert.equal(computedMIMEType(zip).essence, "application/zip");
  });

  it("should detect GZIP", () => {
    const gzip = bytes(0x1F, 0x8B, 0x08);
    assert.equal(computedMIMEType(gzip).essence, "application/x-gzip");
  });

  it("should detect RAR", () => {
    const rar = bytes(0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00);
    assert.equal(computedMIMEType(rar).essence, "application/x-rar-compressed");
  });
});

describe("text/binary distinction", () => {
  it("should detect plain text", () => {
    const text = stringBytes("Hello, world!");
    assert.equal(computedMIMEType(text).essence, "text/plain");
  });

  it("should detect binary data", () => {
    const binary = bytes(0x00, 0x01, 0x02, 0x03);
    assert.equal(computedMIMEType(binary).essence, "application/octet-stream");
  });

  it("should detect UTF-8 BOM as text/plain", () => {
    const utf8bom = bytes(0xEF, 0xBB, 0xBF, 0x48, 0x65, 0x6C, 0x6C, 0x6F);
    assert.equal(computedMIMEType(utf8bom).essence, "text/plain");
  });
});

describe("scriptable types (HTML, XML, PDF)", () => {
  it("should detect HTML when no supplied type", () => {
    const html = stringBytes("<html>");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect XML when no supplied type", () => {
    const xml = stringBytes("<?xml version='1.0'?>");
    assert.equal(computedMIMEType(xml).essence, "text/xml");
  });

  it("should detect PDF when no supplied type", () => {
    const pdf = stringBytes("%PDF-1.4");
    assert.equal(computedMIMEType(pdf).essence, "application/pdf");
  });
});

describe("supplied MIME type handling", () => {
  it("should return HTML type without sniffing", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png, { contentTypeHeader: "text/html" }).essence, "text/html");
  });

  it("should return text/xml type without sniffing", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png, { contentTypeHeader: "text/xml" }).essence, "text/xml");
  });

  it("should return application/xml type without sniffing", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "application/xml" });
    assert.equal(result.essence, "application/xml");
  });

  it("should return +xml type without sniffing", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "image/svg+xml" });
    assert.equal(result.essence, "image/svg+xml");
  });

  it("should not treat image/xml as XML MIME type", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    // "image/xml" is NOT an XML MIME type per spec - only text/xml, application/xml, and +xml are
    // Since it's an image type, it should be sniffed and return "image/png"
    assert.equal(computedMIMEType(png, { contentTypeHeader: "image/xml" }).essence, "image/png");
  });

  it("should sniff when supplied type is unknown/unknown", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png, { contentTypeHeader: "unknown/unknown" }).essence, "image/png");
  });

  it("should sniff when supplied type is application/unknown", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "application/unknown" });
    assert.equal(result.essence, "image/png");
  });
});

describe("noSniff flag", () => {
  it("should respect noSniff and return supplied type", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "text/plain", noSniff: true });
    assert.equal(result.essence, "text/plain");
  });

  it("should still sniff when noSniff is set but type is unknown", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    // noSniff doesn't prevent sniffing for unknown types - it only affects sniff-scriptable
    const result = computedMIMEType(png, { contentTypeHeader: "unknown/unknown", noSniff: true });
    assert.equal(result.essence, "image/png");
  });

  it("should not sniff scriptable types when noSniff is set and type is unknown", () => {
    const html = stringBytes("<html>");
    // With unknown type and noSniff, sniff-scriptable is false, so HTML won't be detected
    const result = computedMIMEType(html, { contentTypeHeader: "unknown/unknown", noSniff: true });
    assert.equal(result.essence, "text/plain");
  });

  it("should bypass noSniff check for HTML types (step 1 returns before step 3)", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    // HTML types are returned at step 1, before noSniff is checked at step 3
    // (though the result is the same either way)
    const result = computedMIMEType(png, { contentTypeHeader: "text/html", noSniff: true });
    assert.equal(result.essence, "text/html");
  });

  it("should bypass noSniff check for XML types (step 1 returns before step 3)", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    // XML types are returned at step 1, before noSniff is checked at step 3
    const result = computedMIMEType(png, { contentTypeHeader: "application/xml", noSniff: true });
    assert.equal(result.essence, "application/xml");
  });
});

describe("Apache bug handling", () => {
  it("should apply text/binary rules for text/plain Apache bug", () => {
    const text = stringBytes("Hello, world!");
    assert.equal(computedMIMEType(text, { contentTypeHeader: "text/plain" }).essence, "text/plain");
  });

  it("should apply text/binary rules for text/plain; charset=ISO-8859-1", () => {
    const binary = bytes(0x00, 0x01, 0x02, 0x03);
    const result = computedMIMEType(binary, { contentTypeHeader: "text/plain; charset=ISO-8859-1" });
    assert.equal(result.essence, "application/octet-stream");
  });

  it("should not apply Apache bug for other text types", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    // text/csv is not an Apache bug value, so it goes through normal sniffing
    assert.equal(computedMIMEType(png, { contentTypeHeader: "text/csv" }).essence, "text/csv");
  });
});

describe("image type sniffing with supplied type", () => {
  it("should sniff image content when supplied type is image/*", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png, { contentTypeHeader: "image/gif" }).essence, "image/png");
  });

  it("should return supplied image type when content doesn't match known signatures", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    assert.equal(computedMIMEType(unknown, { contentTypeHeader: "image/gif" }).essence, "image/gif");
  });
});

describe("isSupported predicate", () => {
  it("should skip sniffing for unsupported image types", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, {
      contentTypeHeader: "image/webp",
      isSupported: () => false
    });
    assert.equal(result.essence, "image/webp");
  });

  it("should sniff for supported image types", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, {
      contentTypeHeader: "image/webp",
      isSupported: mimeType => mimeType.subtype === "webp"
    });
    assert.equal(result.essence, "image/png");
  });
});

describe("providedType option", () => {
  it("should sniff image content for providedType", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    assert.equal(computedMIMEType(png, { providedType: "image/gif" }).essence, "image/png");
  });

  it("should not check Apache bug for providedType", () => {
    const text = stringBytes("Hello, world!");
    // With providedType, Apache bug is not checked, so it goes through normal flow
    // text/plain is not image/audio/video, so it returns as-is
    assert.equal(computedMIMEType(text, { providedType: "text/plain" }).essence, "text/plain");
  });

  it("should return providedType when content doesn't match any signature", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    assert.equal(computedMIMEType(unknown, { providedType: "text/css" }).essence, "text/css");
  });

  it("should return providedType image type when content doesn't match image signatures", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    assert.equal(computedMIMEType(unknown, { providedType: "image/gif" }).essence, "image/gif");
  });
});

describe("MIME type input formats", () => {
  describe("contentTypeHeader", () => {
    it("should accept a string", () => {
      const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
      const result = computedMIMEType(png, { contentTypeHeader: "text/html; charset=utf-8" });
      assert.equal(result.essence, "text/html");
    });

    it("should accept a whatwg-mimetype MIMEType", () => {
      const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
      const mimeType = new MIMEType("text/html; charset=utf-8");
      const result = computedMIMEType(png, { contentTypeHeader: mimeType });
      assert.equal(result.essence, "text/html");
      assert.equal(result.parameters.get("charset"), "utf-8");
    });

    if (NodeMIMEType) {
      it("should accept a Node.js util.MIMEType", () => {
        const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
        const mimeType = new NodeMIMEType("text/html; charset=utf-8");
        const result = computedMIMEType(png, { contentTypeHeader: mimeType });
        assert.equal(result.essence, "text/html");
        // Return type is always whatwg-mimetype, so use .parameters
        assert.equal(result.parameters.get("charset"), "utf-8");
      });
    }
  });

  describe("providedType", () => {
    it("should accept a string", () => {
      const unknown = bytes(0x00, 0x00, 0x00, 0x00);
      const result = computedMIMEType(unknown, { providedType: "text/css; charset=utf-8" });
      assert.equal(result.essence, "text/css");
    });

    it("should accept a whatwg-mimetype MIMEType", () => {
      const unknown = bytes(0x00, 0x00, 0x00, 0x00);
      const mimeType = new MIMEType("text/css; charset=utf-8");
      const result = computedMIMEType(unknown, { providedType: mimeType });
      assert.equal(result.essence, "text/css");
      assert.equal(result.parameters.get("charset"), "utf-8");
    });

    if (NodeMIMEType) {
      it("should accept a Node.js util.MIMEType", () => {
        const unknown = bytes(0x00, 0x00, 0x00, 0x00);
        const mimeType = new NodeMIMEType("text/css; charset=utf-8");
        const result = computedMIMEType(unknown, { providedType: mimeType });
        assert.equal(result.essence, "text/css");
        // Return type is always whatwg-mimetype, so use .parameters
        assert.equal(result.parameters.get("charset"), "utf-8");
      });
    }
  });
});

describe("input canonicalization", () => {
  it("should lowercase type and subtype", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "TEXT/HTML" });
    assert.equal(result.type, "text");
    assert.equal(result.subtype, "html");
    assert.equal(result.essence, "text/html");
  });

  it("should lowercase parameter names", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "text/html; CHARSET=utf-8" });
    assert.equal(result.parameters.get("charset"), "utf-8");
    const keys = [...result.parameters.keys()];
    assert.deepEqual(keys, ["charset"]);
  });

  it("should handle messy input with multiple semicolons", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "TEXT/html;;;charSET=utf-8" });
    assert.equal(result.essence, "text/html");
    assert.equal(result.parameters.get("charset"), "utf-8");
    assert.equal(result.parameters.size, 1);
  });

  it("should canonicalize providedType input", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    const result = computedMIMEType(unknown, { providedType: "TEXT/CSS; CHARSET=UTF-8" });
    assert.equal(result.essence, "text/css");
    assert.equal(result.parameters.get("charset"), "UTF-8");
  });
});

describe("parameter preservation", () => {
  it("should preserve parameters when returning HTML type", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "text/html; charset=utf-8" });
    assert.equal(result.essence, "text/html");
    assert.equal(result.parameters.get("charset"), "utf-8");
  });

  it("should preserve parameters when returning XML type", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "application/xml; charset=utf-8" });
    assert.equal(result.essence, "application/xml");
    assert.equal(result.parameters.get("charset"), "utf-8");
  });

  it("should preserve parameters with noSniff", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "text/css; charset=utf-8", noSniff: true });
    assert.equal(result.essence, "text/css");
    assert.equal(result.parameters.get("charset"), "utf-8");
  });

  it("should preserve parameters when returning supplied type unchanged", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    const result = computedMIMEType(unknown, { contentTypeHeader: "text/css; charset=utf-8" });
    assert.equal(result.essence, "text/css");
    assert.equal(result.parameters.get("charset"), "utf-8");
  });

  it("should preserve parameters from providedType", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    const result = computedMIMEType(unknown, { providedType: "text/css; charset=utf-8" });
    assert.equal(result.essence, "text/css");
    assert.equal(result.parameters.get("charset"), "utf-8");
  });

  it("should not have parameters when sniffing detects a type", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png);
    assert.equal(result.essence, "image/png");
    assert.equal(result.parameters.size, 0);
  });
});
