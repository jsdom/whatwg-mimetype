"use strict";
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const {
  toASCIILowercase,
  solelyContainsHTTPTokenCodePoints,
  soleyContainsHTTPQuotedStringTokenCodePoints
} = require("./utils.js");

module.exports = class MIMEType {
  constructor(string) {
    const result = parse(string);
    if (result === null) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }

    this._type = result.type;
    this._subtype = result.subtype;
    this._parameters = new MIMETypeParameters(result.parameters);
  }

  get essence() {
    return `${this.type}/${this.subtype}`;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    value = String(value);

    if (value.length === 0) {
      throw new Error("Invalid type: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid type ${value}: must contain only HTTP token code points`);
    }

    this._type = value;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    value = String(value);

    if (value.length === 0) {
      throw new Error("Invalid subtype: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid subtype ${value}: must contain only HTTP token code points`);
    }

    this._subtype = value;
  }

  get parameters() {
    return this._parameters;
  }

  toString(options) {
    // The serialize function works on both "MIME type records" (i.e. the results of parse) and on this class, since
    // this class's interface is identical.
    return serialize(this, options);
  }

  isXML() {
    return (this.subtype === "xml" && (this.type === "text" || this.type === "application")) ||
           this.subtype.endsWith("+xml");
  }
  isHTML() {
    return this.subtype === "html" && this.type === "text";
  }
  isText() {
    return this.type === "text";
  }
};

class MIMETypeParameters {
  constructor(map) {
    this._map = map;
  }

  get size() {
    return this._map.size;
  }

  get(name) {
    name = String(toASCIILowercase(name));
    return this._map.get(name);
  }

  has(name) {
    name = String(toASCIILowercase(name));
    return this._map.has(name);
  }

  set(name, value) {
    name = String(toASCIILowercase(name));
    value = String(value);

    if (!solelyContainsHTTPTokenCodePoints(name)) {
      throw new Error(`Invalid MIME type parameter name "${name}": only HTTP token code points are valid.`);
    }
    if (!soleyContainsHTTPQuotedStringTokenCodePoints(value)) {
      throw new Error(`Invalid MIME type parameter value "${value}": only HTTP quoted-string token code points are ` +
                      `valid.`);
    }

    return this._map.set(name, value);
  }

  clear() {
    this._map.clear();
  }

  delete(name) {
    name = String(toASCIILowercase(name));
    return this._map.delete(name);
  }

  forEach(callbackFn, thisArg) {
    this._map.forEach(callbackFn, thisArg);
  }

  keys() {
    return this._map.keys();
  }

  values() {
    return this._map.values();
  }

  entries() {
    return this._map.entries();
  }

  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}
