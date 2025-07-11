const fs = require('fs');
const path = require('path');
const constants = require('./constants');


interface LogObject {
  source?: string;
  via?: string;
  [key: string]: any; // Permite propiedades adicionales
}

//export default async function (opts: any) {
//export const fileTransport = async (opts:any ) => {
module.exports = async function (opts: any) {
  const filePath = path.join(constants.LOG_FOLDER, constants.LOG_FILE);
  
  const stream = fs.createWriteStream(filePath, { flags: 'a' });

  return {
    write: async (logLine: string) => {
      try {
        const logObj: LogObject = JSON.parse(logLine);
 
        if (!logObj.source) {
          logObj.source = constants.APP_LOG_AUTH;
        }

        logObj.via = constants.PINO_FILE;

        stream.write(JSON.stringify(logObj) + '\n');
      } catch (err: unknown ) {
	     if (err instanceof Error) {
           console.error('file-transport error:', err.message);
         } else {
          console.error('Error desconocido', err);
         }
      }
    }
  };
}
