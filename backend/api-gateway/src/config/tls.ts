const fs = require('fs')
const path = require('path')

const certPath =  path.join(__dirname, '../../certs')

const tlsOptions = {
    key: fs.readFileSync(path.join(certPath, 'key.pem')),
    cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
}

module.exports = {
    tlsConfig: tlsOptions,
}