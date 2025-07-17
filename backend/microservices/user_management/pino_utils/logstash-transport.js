const { PINO_HTTP, APP_LOG_AUTH } = require('./constants.js')

const logstashTransport = async (opts) => {
  return {
    write: async (logLine) => {

      try {
        const logObj = JSON.parse(logLine);

        if (!logObj.source) {
          logObj.source = APP_LOG_AUTH;
        }

	logObj.via = PINO_HTTP;
       
        await fetch('http://logstash:5044', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logObj),
        });
      } catch (err) {
        console.error('Logstash transport error:', err);
      }
    }
  };
};

module.exports = logstashTransport;
