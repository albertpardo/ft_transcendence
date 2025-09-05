const http = require('http');

const data = JSON.stringify({
  email: "test@localhost.com",
  name: "Test User",
  picture: "https://i.pravatar.cc/150",
  googleId: "123456"
});

const options = {
  hostname: 'user_management',
  port: 9001,
  path: '/api/user/upsert-google',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
