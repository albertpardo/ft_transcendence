const { LOG_FOLDER, LOG_FILE } = require('./constants.js');
const { dirname, resolve, join } = require('path');
//const { fileURLToPath } = require('url');

// Función que devuelve la configuración del transporte
const getLogTransportConfig = () => {
 // const __filename = fileURLToPath(import.meta.url);
//  const __dirname = dirname(__filename);
 
  return {
    targets: [
      {
        target: resolve(__dirname, 'file-transport.js'),
        options: {
          destination: join(LOG_FOLDER, LOG_FILE),
          mkdir: true
        }
      },
      {
        target: 'pino-pretty',
        options: {
	      colorize: true,
		  ignore : 'time'
		}
      },
      {
        target: resolve(__dirname, 'logstash-transport.js'),
        level: 'info'
      }
    ]
  };
};

module.exports = getLogTransportConfig;
