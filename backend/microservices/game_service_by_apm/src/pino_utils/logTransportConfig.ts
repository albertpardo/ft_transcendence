import { LOG_FOLDER, LOG_FILE } from './constants'
import { join, resolve } from 'path';
import { fileTransport } from './file-transport';
import { logstashTransport } from './logstash-transport'
//import pino from 'pino';

// Función que devuelve la configuración del transporte
export const getLogTransportConfig = () => {

  console.log("getLogTransportConfig ->" + resolve(__dirname, 'file-transport.js'));
  return {
    targets: [
      {
 //       target: './dist/pino_utils/file-transport.js', // Guarda logs en archivo
        target: resolve(__dirname, 'file-transport.js'),
        options: {
          destination: join('/shared_logs', 'app.log'),
          mkdir: true
        }
      },
      {
        target: 'pino-pretty', // Modo legible en desarrollo
        options: {
          colorize: true
        }
      },
      {
        target: resolve(__dirname, 'logstash-transport.js'), // Envío a Logstash
        level: 'info'
      }
    ]
  };
};
