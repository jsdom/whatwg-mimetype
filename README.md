# Parse, serialize, and manipulate MIME types

This package will parse [MIME types](https://mimesniff.spec.whatwg.org/#understanding-mime-types) into a structured format, which can then be manipulated and serialized:

```js
const MIMEType = require("content-type-parser");

const mimeType = new MIMEType(`Text/HTML;Charset="utf-8"`);

console.assert(mimeType.toString() === "text/html;charset=utf-8");

console.assert(mimeType.type === "text");
console.assert(mimeType.subtype === "html");
console.assert(mimeType.essence === "text/html");
console.assert(mimeType.parameters.get("charset") === "utf-8");

mimeType.parameters.set("charset", "windows-1252");
console.assert(mimeType.parameters.get("charset") === "windows-1252");
console.assert(mimeType.toString() === "text/html;charset=windows-1252");

console.assert(mimeType.isHTML() === true);
console.assert(mimeType.isXML() === false);
console.assert(mimeType.isText() === true);
```

Parsing is a fairly complex process; see [the specification](https://mimesniff.spec.whatwg.org/#parsing-a-mime-type) for details (and similarly [for serialization](https://mimesniff.spec.whatwg.org/#serializing-a-mime-type)).

If the passed string cannot be parsed as a MIME type, the `MIMEType` constructor will throw.

TODO update the below:

## `ContentType` instance API

This package's main module's default export will return an instance of the `ContentType` class, which has the following public APIs:

### Properties

- `type`: the top-level media type, e.g. `"text"`
- `subtype`: the subtype, e.g. `"html"`
- `parameterList`: an array of `{ separator, key, value }` pairs representing the parameters. The `separator` field contains any whitespace, not just the `;` character.

### Parameter manipulation

In general you should not directly manipulate `parameterList`. Instead, use the following APIs:

- `get("key")`: returns the value of the parameter with the given key, or `undefined` if no such parameter is present
- `set("key", "value")`: adds the given key/value pair to the parameter list, or overwrites the existing value if an entry already existed

Both of these will lowercase the keys.

### MIME type tests

- `isHTML()`: returns true if this instance's MIME type is [the HTML MIME type](https://html.spec.whatwg.org/multipage/infrastructure.html#html-mime-type), `"text/html"`
- `isXML()`: returns true if this instance's MIME type is [an XML MIME type](https://html.spec.whatwg.org/multipage/infrastructure.html#xml-mime-type)
- `isText()`: returns true if this instance's top-level media type is `"text"`

### Serialization

- `toString()` will return a canonicalized representation of the content-type, re-built from the parsed components

## Credits

This package was originally based on the excellent work of [@nicolashenry](https://github.com/nicolashenry), [in jsdom](https://github.com/tmpvar/jsdom/blob/16fd85618f2705d181232f6552125872a37164bc/lib/jsdom/living/helpers/headers.js). It has since been pulled out into this separate package.
