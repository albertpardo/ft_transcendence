import { PINO_HTTP, APP_LOG_AUTH } from './constants'

interface LogObject {
  source?: string;
  via?: string;
  [key: string]: any; // Permite propiedades adicionales
}

//export default async function (opts: any) {
const logstashTransport = async (opts:any ) => {
  return {
    write: async (logLine: string ) => {
      try {
        const logObj: LogObject = JSON.parse(logLine);

        if (!logObj.source) {
          logObj.source = APP_LOG_AUTH;
        }

        logObj.via = PINO_HTTP;
       
        await fetch('http://logstash:5044', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logObj),
        });
      } catch (err: unknown ) {
	     if (err instanceof Error) {
           console.error('Logstash transport error:', err.message);
         } else {
          console.error('Error desconocido', err);
         }
      }
    }
  };
};

module.exports = logstashTransport;
