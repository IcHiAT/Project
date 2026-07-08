/* Winziger statischer Server zum lokalen Testen der App (keine Abhängigkeiten). */
'use strict';
const http = require('http');
const { readFileSync, existsSync, statSync } = require('fs');
const { extname, join, normalize } = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html'; // z. B. '/' oder '/pirate/' -> jeweiliges index.html
  const fp = normalize(join(ROOT, p));
  if (!fp.startsWith(ROOT) || !existsSync(fp) || statSync(fp).isDirectory()) {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' });
  res.end(readFileSync(fp));
}).listen(PORT, () => console.log(`Skull King läuft auf http://localhost:${PORT}`));
