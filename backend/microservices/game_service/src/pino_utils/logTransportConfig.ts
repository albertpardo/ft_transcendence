import { LOG_FOLDER, LOG_FILE } from './constants'
import { join, resolve } from 'path';

// transport config
export const getLogTransportConfig = () => {

  return {
    targets: [
      {
        target: resolve(__dirname, 'file-transport.js'),
        options: {
          destination: join('/shared_logs', 'app.log'),
          mkdir: true
        }
      },
      {
        target: 'pino-pretty', // Modo legible en desarrollo
        options: {
          colorize: true,
		  ignore : 'time'
        }
      },
      {
        target: resolve(__dirname, 'logstash-transport.js'), // Envío a Logstash
        level: 'info'
      }
    ]
  };
};
