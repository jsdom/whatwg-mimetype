import { asciiLowercase, solelyContainsHTTPTokenCodePoints, solelyContainsHTTPQuotedStringTokenCodePoints } from './utils.js';

export default class MIMETypeParameters {
  constructor(map) {
    this._map = map;
  }

  get size() {
    return this._map.size;
  }

  get(name) {
    return this._map.get(asciiLowercase(String(name)));
  }

  has(name) {
    return this._map.has(asciiLowercase(String(name)));
  }

  set(name, value) {		
    name = asciiLowercase(String(name));
    value = String(value);

    if (!solelyContainsHTTPTokenCodePoints(name)) {
      throw new Error(`Invalid MIME type parameter name "${name}": only HTTP token code points are valid.`);
    }

    if (!solelyContainsHTTPQuotedStringTokenCodePoints(value)) {
      throw new Error(`Invalid MIME type parameter value "${value}": only HTTP quoted-string token code points are valid.`);
    }

    return this._map.set(name, value);
  }

  clear() {
    this._map.clear();
  }

  delete(name) {
    name = asciiLowercase(String(name));
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
};