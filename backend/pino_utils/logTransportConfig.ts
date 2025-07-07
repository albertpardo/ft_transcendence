import { LOG_FOLDER, LOG_FILE } from './constants'
import { join } from 'path';

// Función que devuelve la configuración del transporte
export const getLogTransportConfig = () => {
  return {
    targets: [
      {
        target: './file-transport.ts', // Guarda logs en archivo
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
        target: './logstash-transport.ts', // Envío a Logstash
        level: 'info'
      }
    ]
  };
};

