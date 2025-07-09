import { createWriteStream } from 'fs';
import { join } from 'path';
import { PINO_FILE, LOG_FOLDER, LOG_FILE, APP_LOG_AUTH } from './constants'

interface LogObject {
  source?: string;
  via?: string;
  [key: string]: any; // Permite propiedades adicionales
}

//export default async function (opts: any) {
export const fileTransport = async (opts:any ) => {
  const filePath = join(LOG_FOLDER, LOG_FILE);
  
  const stream = createWriteStream(filePath, { flags: 'a' });

  return {
    write: async (logLine: string) => {
      try {
        const logObj: LogObject = JSON.parse(logLine);
 
        if (!logObj.source) {
          logObj.source = APP_LOG_AUTH;
        }

        logObj.via = PINO_FILE;

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
