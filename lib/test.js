"use strict";
const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "Text/HTML;Charset=\"utf-8\"" });
  res.end("<p>Hello</p>");
}).listen(8080);
