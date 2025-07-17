const { createWriteStream } = require('fs');
const { join } = require('path');
const { PINO_FILE, LOG_FOLDER, LOG_FILE, APP_LOG_AUTH } = require('./constants.js');

const fileTransport = async (opts) => {
  const filePath = join(LOG_FOLDER, LOG_FILE);
  
  const stream = createWriteStream(filePath, { flags: 'a' });

  return {
    write: async (logLine) => {
      try {
        const logObj = JSON.parse(logLine);
 
        if (!logObj.source) {
          logObj.source = APP_LOG_AUTH;
        }

        logObj.via = PINO_FILE;

        stream.write(JSON.stringify(logObj) + '\n');
      } catch (err) {
        console.error('Logstash transport error:', err);
      }
    }
  };
};

module.exports = fileTransport;
