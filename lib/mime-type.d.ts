// Type definitions for whatwg-mimetype 2.1.0
// Project: jsdom
// Definitions by: Pete Johanson <https://github.com/petejohanson>

export = MIMEType;

declare class MIMEType {
  type: string;
  subtype: string;

  readonly essence: string;
  readonly parameters: Map<string, string>;

  static parse(s: string): MIMEType | null;

  constructor(s: string);

  isHTML(): boolean;
  isXML(): boolean;
  isJavaScript(opts?: { allowParameters?: boolean }): boolean;
}
