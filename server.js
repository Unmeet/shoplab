#!/usr/bin/env node
// ShopLab practice server. No dependencies: needs Node.js 18 or newer.
// Usage: node server.js            (port 3000)
//        PORT=8080 node server.js  (custom port)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_FILE = process.env.SHOPLAB_PERSIST ? path.join(__dirname, 'shoplab-data.json') : null;

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
const coreSource = /<script id="api-core">([\s\S]*?)<\/script>/.exec(html);
if (!coreSource) { console.error('Could not find the API core inside public/index.html'); process.exit(1); }
const ShopLabCore = new Function(coreSource[1] + '\nreturn ShopLabCore;')();
const page = html.replace('window.__SHOPLAB_MODE__ = "mock"', 'window.__SHOPLAB_MODE__ = "server"');

const backend = ShopLabCore.createBackend({
  mode: 'server',
  load: () => (DATA_FILE && fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : null),
  save: db => { if (DATA_FILE) fs.writeFileSync(DATA_FILE, JSON.stringify(db)); }
});

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization, X-Client-Id, X-File-Name',
  'access-control-expose-headers': 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After, Location'
};

function log(req, status, ms) {
  const c = status >= 500 ? 31 : status >= 400 ? 33 : 32;
  console.log(`\x1b[2m${new Date().toISOString()}\x1b[0m ${req.method.padEnd(6)} ${req.url} \x1b[${c}m${status}\x1b[0m ${ms}ms`);
}

const server = http.createServer((req, res) => {
  const t0 = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (!url.pathname.startsWith('/api')) {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page); log(req, 200, Date.now() - t0); return;
    }
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><title>Not found</title><h1>404: page not found</h1><p><a href="/">Back to ShopLab</a></p>');
    log(req, 404, Date.now() - t0); return;
  }

  const chunks = [];
  let size = 0;
  req.on('data', c => { size += c.length; if (size <= 10 * 1024 * 1024) chunks.push(c); });
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    const ctype = req.headers['content-type'] || '';
    let body, bodyError = false;
    if (raw.length) {
      if (ctype.includes('json')) { try { body = JSON.parse(raw); } catch (e) { bodyError = true; } }
      else body = raw;
    }
    const query = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const out = backend.handle({ method: req.method, path: url.pathname, query, headers: req.headers, body, bodyError, rawLength: size });
    setTimeout(() => {
      const headers = Object.assign({}, CORS, out.headers);
      const hasBody = out.body !== null && out.body !== undefined && out.status !== 204 && out.status !== 304;
      const payload = hasBody ? (out.raw ? String(out.body) : JSON.stringify(out.body, null, 2)) : '';
      res.writeHead(out.status, headers);
      res.end(payload);
      log(req, out.status, Date.now() - t0);
    }, out.delay || 0);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  ShopLab is running.\n\n  Store:  http://localhost:${PORT}\n  API:    http://localhost:${PORT}/api\n  Health: http://localhost:${PORT}/api/health\n\n  Test users: standard_user, locked_user, slow_user, error_user, admin`);
  console.log(`  Password:   ${ShopLabCore.PASSWORD}\n  Data:       ${DATA_FILE ? 'saved to shoplab-data.json' : 'in memory (resets when the server stops)'}\n`);
});
