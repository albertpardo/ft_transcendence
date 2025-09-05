const https = require('https');
const fs = require('fs');
const path = require('path');

const key = fs.readFileSync(path.join(__dirname, 'certs/key.pem'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, 'certs/cert.pem'), 'utf8');

const server = https.createServer({ key, cert }, (req, res) => {
  // console.log('🔥 Request:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello HTTPS' }));
});

server.listen(8443, '0.0.0.0', () => {
  console.info('✅ Test server listening on https://localhost:8443');
});