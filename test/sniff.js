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

describe("resource header truncation", () => {
  it("should truncate resources larger than 1445 bytes", () => {
    // Create a resource larger than 1445 bytes with PNG signature at the start
    const largeResource = new Uint8Array(2000);
    // PNG signature
    largeResource.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 0);
    assert.equal(computedMIMEType(largeResource).essence, "image/png");
  });
});

describe("HTML with leading whitespace", () => {
  it("should detect HTML with leading spaces", () => {
    const html = stringBytes("   <html>");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect HTML with leading tabs and newlines", () => {
    const html = stringBytes("\t\n\r<HTML>");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect <!DOCTYPE HTML with leading whitespace", () => {
    const html = stringBytes("  <!DOCTYPE HTML ");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect <HEAD with leading whitespace", () => {
    const html = stringBytes(" <head ");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect <SCRIPT with leading whitespace", () => {
    const html = stringBytes(" <script ");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect <BODY with leading whitespace", () => {
    const html = stringBytes("\n<body ");
    assert.equal(computedMIMEType(html).essence, "text/html");
  });

  it("should detect XML with leading whitespace", () => {
    const xml = stringBytes("  <?xml");
    assert.equal(computedMIMEType(xml).essence, "text/xml");
  });
});

describe("MP4 detection", () => {
  it("should detect MP4 with mp41 brand", () => {
    // ftyp box: length (12 bytes) + "ftyp" + "mp41"
    const mp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x0C, // length = 12
      0x66,
      0x74,
      0x79,
      0x70, // "ftyp"
      0x6D,
      0x70,
      0x34,
      0x31 // "mp41"
    );
    assert.equal(computedMIMEType(mp4).essence, "video/mp4");
  });

  it("should detect MP4 with isom brand", () => {
    const mp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x0C,
      0x66,
      0x74,
      0x79,
      0x70,
      0x69,
      0x73,
      0x6F,
      0x6D // "isom"
    );
    assert.equal(computedMIMEType(mp4).essence, "video/mp4");
  });

  it("should detect MP4 with compatible brand in list", () => {
    // ftyp box with unknown primary brand but mp42 in compatible brands
    const mp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x14, // length = 20
      0x66,
      0x74,
      0x79,
      0x70, // "ftyp"
      0x58,
      0x58,
      0x58,
      0x58, // "XXXX" (unknown brand)
      0x00,
      0x00,
      0x00,
      0x00, // minor version
      0x6D,
      0x70,
      0x34,
      0x32 // "mp42" (compatible brand)
    );
    assert.equal(computedMIMEType(mp4).essence, "video/mp4");
  });

  it("should not detect MP4 with invalid length", () => {
    // ftyp box with length smaller than 12
    const notMp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x08, // length = 8 (too small)
      0x66,
      0x74,
      0x79,
      0x70,
      0x6D,
      0x70,
      0x34,
      0x31
    );
    assert.notEqual(computedMIMEType(notMp4).essence, "video/mp4");
  });

  it("should not detect MP4 when length exceeds resource size", () => {
    // ftyp box with length larger than actual data
    const notMp4 = bytes(
      0x00,
      0x00,
      0x00,
      0xFF, // length = 255 (way too large)
      0x66,
      0x74,
      0x79,
      0x70,
      0x6D,
      0x70,
      0x34,
      0x31
    );
    assert.notEqual(computedMIMEType(notMp4).essence, "video/mp4");
  });
});

describe("WebM detection", () => {
  it("should detect WebM with EBML header and DocType", () => {
    // EBML header (0x1A 0x45 0xDF 0xA3) + DocType element (0x42 0x82) + vint length + "webm" + extra bytes
    const webm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3, // EBML header
      0x42,
      0x82, // DocType element ID
      0x84, // VINT: length = 4 (0x80 | 4)
      0x77,
      0x65,
      0x62,
      0x6D, // "webm"
      0x00,
      0x00,
      0x00,
      0x00 // extra bytes to ensure enough length
    );
    assert.equal(computedMIMEType(webm).essence, "video/webm");
  });

  it("should detect WebM with padded DocType value", () => {
    // WebM with leading 0x00 bytes before "webm"
    const webm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x86, // VINT: length = 6 (0x80 | 6)
      0x00,
      0x00, // padding
      0x77,
      0x65,
      0x62,
      0x6D, // "webm"
      0x00,
      0x00,
      0x00,
      0x00 // extra bytes
    );
    assert.equal(computedMIMEType(webm).essence, "video/webm");
  });

  it("should not detect WebM without EBML header", () => {
    const notWebm = bytes(0x00, 0x00, 0x00, 0x00);
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM with too short resource", () => {
    const notWebm = bytes(0x1A, 0x45, 0xDF);
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when DocType element is at end of resource (no VINT)", () => {
    // EBML header + DocType element but no room for VINT
    const notWebm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82
    );
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when VINT indicates length exceeding resource", () => {
    // A 0x00 VINT byte has no leading 1 bit, so parseVint returns 8 (max VINT length).
    // Adding 8 to iter exceeds the resource length, so WebM is not detected.
    const notWebm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x00,
      0x77,
      0x65,
      0x62,
      0x6D
    );
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when not enough bytes after VINT for pattern", () => {
    // EBML header + DocType + valid VINT but resource ends before "webm" can fit
    const notWebm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x84,
      0x77,
      0x65
    );
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when DocType value is not 'webm'", () => {
    // EBML header + DocType + valid VINT + wrong content ("matr" not "webm")
    const notWebm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x84,
      0x6D,
      0x61,
      0x74,
      0x72,
      0x00,
      0x00,
      0x00,
      0x00
    );
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when scanning past DocType without finding valid match", () => {
    // EBML header but no DocType element found in bytes 4-37
    const notWebm = new Uint8Array(38);
    notWebm[0] = 0x1A;
    notWebm[1] = 0x45;
    notWebm[2] = 0xDF;
    notWebm[3] = 0xA3;
    // Rest are zeros (no 0x42 0x82 pattern)
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });

  it("should not detect WebM when padded zeros push offset beyond available bytes", () => {
    // After VINT, matchPaddedSequence skips 0x00 bytes. If there are many zeros,
    // the offset can exceed the available space for the "webm" pattern.
    // VINT 0x8A means 10 bytes follow. 7 zeros then "web" (3 bytes) - not enough for "webm"
    const notWebm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x8A,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x77,
      0x65,
      0x62
    );
    assert.notEqual(computedMIMEType(notWebm).essence, "video/webm");
  });
});

describe("MP3 without ID3 detection", () => {
  it("should detect MP3 without ID3 tag (two valid frames)", () => {
    // MP3 frame sync: 0xFF 0xFB (MPEG1 Layer3)
    // We need two consecutive valid frames
    // Frame header: 0xFF 0xFB 0x90 0x00 = MPEG1 Layer3, 128kbps, 44100Hz, no padding
    // Frame size = 144 * 128000 / 44100 = 417 bytes
    const mp3Header = [0xFF, 0xFB, 0x90, 0x00];
    const frameSize = 417;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    mp3.set(mp3Header, frameSize);
    assert.equal(computedMIMEType(mp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 with invalid layer", () => {
    // 0xFF 0xE0 has layer = 0 which is invalid
    const notMp3 = bytes(0xFF, 0xE0, 0x00, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 with invalid bitrate index", () => {
    // Bitrate index 15 is invalid
    const notMp3 = bytes(0xFF, 0xFB, 0xF0, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 with invalid sample rate index", () => {
    // Sample rate index 3 is invalid
    const notMp3 = bytes(0xFF, 0xFB, 0x0C, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 with Layer 2 instead of Layer 3", () => {
    // Layer bits in byte[1] & 0x06: 01=Layer3, 10=Layer2, 11=Layer1
    // 0xFD & 0x06 = 0x04, >> 1 = 2 (Layer 2), finalLayer = (4-2) & 3 = 2
    // Valid sync, valid bitrate/samplerate, but wrong layer
    const notMp3 = bytes(0xFF, 0xFD, 0x90, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 with Layer 1 instead of Layer 3", () => {
    // 0xFF & 0x06 = 0x06, >> 1 = 3 (Layer 1), finalLayer = (4-3) & 3 = 1
    const notMp3 = bytes(0xFF, 0xFF, 0x90, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });

  it("should detect MP3 with MPEG2 version (version bits 01)", () => {
    // 0xEB: sync (111), version bits 01 (MPEG2 → version=1), layer bits 01 (Layer 3)
    // version=1 uses scale=72 in frame size calculation
    // bitrate index 9 = 128kbps, samplerate index 0 = 44100Hz
    // Frame size = floor(128000 * 72 / 44100) = 208 bytes
    const mp3Header = [0xFF, 0xEB, 0x90, 0x00];
    const frameSize = 208;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    mp3.set(mp3Header, frameSize);
    assert.equal(computedMIMEType(mp3).essence, "audio/mpeg");
  });
});

describe("UTF-16 BOM detection in text/binary rules", () => {
  it("should detect UTF-16 BE BOM as text/plain with Apache bug", () => {
    const utf16be = bytes(0xFE, 0xFF, 0x00, 0x48, 0x00, 0x69);
    const result = computedMIMEType(utf16be, { contentTypeHeader: "text/plain" });
    assert.equal(result.essence, "text/plain");
  });

  it("should detect UTF-16 LE BOM as text/plain with Apache bug", () => {
    const utf16le = bytes(0xFF, 0xFE, 0x48, 0x00, 0x69, 0x00);
    const result = computedMIMEType(utf16le, { contentTypeHeader: "text/plain" });
    assert.equal(result.essence, "text/plain");
  });

  it("should detect UTF-8 BOM as text/plain with Apache bug", () => {
    const utf8bom = bytes(0xEF, 0xBB, 0xBF, 0x48, 0x65, 0x6C, 0x6C, 0x6F);
    const result = computedMIMEType(utf8bom, { contentTypeHeader: "text/plain" });
    assert.equal(result.essence, "text/plain");
  });
});

describe("audio/video type sniffing with supplied type", () => {
  it("should sniff audio content when supplied type is audio/*", () => {
    const mp3 = bytes(0x49, 0x44, 0x33); // ID3 tag
    const result = computedMIMEType(mp3, { contentTypeHeader: "audio/wav" });
    assert.equal(result.essence, "audio/mpeg");
  });

  it("should sniff video content when supplied type is video/*", () => {
    // MP4 with isom brand
    const mp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x0C,
      0x66,
      0x74,
      0x79,
      0x70,
      0x69,
      0x73,
      0x6F,
      0x6D
    );
    const result = computedMIMEType(mp4, { contentTypeHeader: "video/webm" });
    assert.equal(result.essence, "video/mp4");
  });

  it("should sniff application/ogg when supplied type is application/ogg", () => {
    // OGG signature
    const ogg = bytes(0x4F, 0x67, 0x67, 0x53, 0x00);
    const result = computedMIMEType(ogg, { contentTypeHeader: "application/ogg" });
    assert.equal(result.essence, "application/ogg");
  });

  it("should return supplied audio type when content doesn't match signatures", () => {
    const unknown = bytes(0x00, 0x00, 0x00, 0x00);
    const result = computedMIMEType(unknown, { contentTypeHeader: "audio/wav" });
    assert.equal(result.essence, "audio/wav");
  });

  it("should skip audio/video sniffing for unsupported types", () => {
    const ogg = bytes(0x4F, 0x67, 0x67, 0x53, 0x00);
    const result = computedMIMEType(ogg, {
      contentTypeHeader: "audio/wav",
      isSupported: () => false
    });
    assert.equal(result.essence, "audio/wav");
  });
});

describe("additional audio/video signatures", () => {
  it("should detect AIFF", () => {
    // FORM....AIFF
    const aiff = bytes(
      0x46,
      0x4F,
      0x52,
      0x4D, // "FORM"
      0x00,
      0x00,
      0x00,
      0x00, // size (ignored)
      0x41,
      0x49,
      0x46,
      0x46 // "AIFF"
    );
    assert.equal(computedMIMEType(aiff).essence, "audio/aiff");
  });

  it("should detect AVI", () => {
    // RIFF....AVI
    const avi = bytes(
      0x52,
      0x49,
      0x46,
      0x46, // "RIFF"
      0x00,
      0x00,
      0x00,
      0x00, // size (ignored)
      0x41,
      0x56,
      0x49,
      0x20 // "AVI "
    );
    assert.equal(computedMIMEType(avi).essence, "video/avi");
  });

  it("should detect WAV", () => {
    // RIFF....WAVE
    const wav = bytes(
      0x52,
      0x49,
      0x46,
      0x46, // "RIFF"
      0x00,
      0x00,
      0x00,
      0x00, // size (ignored)
      0x57,
      0x41,
      0x56,
      0x45 // "WAVE"
    );
    assert.equal(computedMIMEType(wav).essence, "audio/wave");
  });

  it("should detect WebP", () => {
    // RIFF....WEBPVP
    const webp = bytes(
      0x52,
      0x49,
      0x46,
      0x46, // "RIFF"
      0x00,
      0x00,
      0x00,
      0x00, // size (ignored)
      0x57,
      0x45,
      0x42,
      0x50, // "WEBP"
      0x56,
      0x50 // "VP"
    );
    assert.equal(computedMIMEType(webp).essence, "image/webp");
  });

  it("should detect CUR (cursor) as image/x-icon", () => {
    const cur = bytes(0x00, 0x00, 0x02, 0x00);
    assert.equal(computedMIMEType(cur).essence, "image/x-icon");
  });
});

describe("PostScript detection", () => {
  it("should detect PostScript", () => {
    const ps = stringBytes("%!PS-Adobe-");
    assert.equal(computedMIMEType(ps).essence, "application/postscript");
  });
});

describe("sniffing when type is */*", () => {
  it("should sniff when supplied type is */*", () => {
    const png = bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    const result = computedMIMEType(png, { contentTypeHeader: "*/*" });
    assert.equal(result.essence, "image/png");
  });
});

describe("MP4 edge cases", () => {
  it("should not detect MP4 with no matching compatible brands", () => {
    // ftyp box with unknown primary brand and no matching compatible brands
    const notMp4 = bytes(
      0x00,
      0x00,
      0x00,
      0x18, // length = 24
      0x66,
      0x74,
      0x79,
      0x70, // "ftyp"
      0x58,
      0x58,
      0x58,
      0x58, // "XXXX" (unknown brand)
      0x00,
      0x00,
      0x00,
      0x00, // minor version
      0x59,
      0x59,
      0x59,
      0x59, // "YYYY" (unknown compatible brand)
      0x5A,
      0x5A,
      0x5A,
      0x5A // "ZZZZ" (unknown compatible brand)
    );
    assert.notEqual(computedMIMEType(notMp4).essence, "video/mp4");
  });
});

describe("MP3 edge cases", () => {
  it("should detect MP3 with padding bit set", () => {
    // Frame header with padding: 0xFF 0xFB 0x92 0x00 = MPEG1 Layer3, 128kbps, 44100Hz, padding
    // Frame size = 144 * 128000 / 44100 + 1 = 418 bytes
    const mp3Header = [0xFF, 0xFB, 0x92, 0x00];
    const frameSize = 418;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    mp3.set(mp3Header, frameSize);
    assert.equal(computedMIMEType(mp3).essence, "audio/mpeg");
  });

  it("should detect MP3 MPEG2.5 (lower bitrates)", () => {
    // 0xFF 0xE3 = MPEG2.5 Layer3 (version bits = 00)
    // 0x40 = bitrate index 4 (32kbps for MPEG2.5), sample rate index 0 (44100Hz per spec table)
    // Frame size = floor(144 * 32000 / 44100) = 104 bytes
    const mp3Header = [0xFF, 0xE3, 0x40, 0x00];
    const frameSize = 104;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    mp3.set(mp3Header, frameSize);
    assert.equal(computedMIMEType(mp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 when second frame header is invalid", () => {
    // Valid first frame but second frame doesn't match
    const mp3Header = [0xFF, 0xFB, 0x90, 0x00];
    const frameSize = 417;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    // Don't set a valid header at frameSize - leave as zeros
    assert.notEqual(computedMIMEType(mp3).essence, "audio/mpeg");
  });

  it("should not detect MP3 when frame size is too small", () => {
    // Frame header with bitrate index 0 results in 0 bitrate -> frame size calculation issue
    const notMp3 = bytes(0xFF, 0xFB, 0x00, 0x00);
    assert.notEqual(computedMIMEType(notMp3).essence, "audio/mpeg");
  });
});

describe("WebM detection via matchAudioOrVideoType", () => {
  it("should detect WebM when supplied type is video/*", () => {
    const webm = bytes(
      0x1A,
      0x45,
      0xDF,
      0xA3,
      0x42,
      0x82,
      0x84,
      0x77,
      0x65,
      0x62,
      0x6D,
      0x00,
      0x00,
      0x00,
      0x00
    );
    const result = computedMIMEType(webm, { contentTypeHeader: "video/x-unknown" });
    assert.equal(result.essence, "video/webm");
  });
});

describe("MP3 without ID3 via matchAudioOrVideoType", () => {
  it("should detect MP3 without ID3 when supplied type is audio/*", () => {
    const mp3Header = [0xFF, 0xFB, 0x90, 0x00];
    const frameSize = 417;
    const mp3 = new Uint8Array(frameSize + 4);
    mp3.set(mp3Header, 0);
    mp3.set(mp3Header, frameSize);
    const result = computedMIMEType(mp3, { contentTypeHeader: "audio/x-unknown" });
    assert.equal(result.essence, "audio/mpeg");
  });
});
