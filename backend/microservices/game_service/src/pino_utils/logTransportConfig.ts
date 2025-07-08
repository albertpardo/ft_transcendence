import { LOG_FOLDER, LOG_FILE } from './constants.ts'
import { join } from 'path';
import { fileTransport } from './file-transport.ts';
import { logstashTransport } from './logstash-transport.ts'

// Función que devuelve la configuración del transporte
export const getLogTransportConfig = () => {
  return {
    targets: [
      {
//        target: './file-transport.ts', // Guarda logs en archivo
        target: fileTransport, // Guarda logs en archivo
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
        target: logstashTransport, // Envío a Logstash
        level: 'info'
      }
    ]
  };
};
