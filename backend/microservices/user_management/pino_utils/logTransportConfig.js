const { LOG_FOLDER, LOG_FILE } = require('./constants.js');

const { resolve, join } = require('path');

// Función que devuelve la configuración del transporte
const getLogTransportConfig = () => {
 
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
