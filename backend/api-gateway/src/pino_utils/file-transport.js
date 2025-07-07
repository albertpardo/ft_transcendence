import { createWriteStream } from 'fs';
import { join } from 'path';
import { PINO_FILE, LOG_FOLDER, LOG_FILE, APP_LOG_AUTH } from './constants.js'

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
        console.error('file-transport error:', err.message);
      }
    }
  };
};

module.exports = fileTransport;

