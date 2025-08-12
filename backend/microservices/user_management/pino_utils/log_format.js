const stringify = require('safe-stable-stringify');

/*
function formatString(msg) {

  if (msg instanceof Error) {
    // Extracts its own properties and those of the prototype
    const { name, message, stack } = msg;

    const extraEntries = Object.entries(msg).filter(
      ([key]) => !['name', 'message', 'stack'].includes(key)
    );

    const extraProps = extraEntries.length
      ? `\nExtra: ${stringify(Object.fromEntries(extraEntries))}`
      : '';

    return `${name}: ${message}${stack ? '\n' + stack : ''}${extraProps}`;
  }

  if (typeof msg === 'string') {
    return msg;
  }

  try {
    return stringify(msg) ?? String(msg);
  } catch {
    return String(msg);
  }
}

function logFormat(source, msg) {
  return {
    source,
    message: formatString(msg)
  };
}
*/


function getString(value) {

    if (value instanceof Error) {
      // Extracts its own properties and those of the prototype
      const { name, message, stack } = value;

      const extraEntries = Object.entries(value).filter(
        ([key]) => !['name', 'message', 'stack'].includes(key)
      );

      const extraProps = extraEntries.length
        ? `\nExtra: ${stringify(Object.fromEntries(extraEntries))}`
        : '';

      return `${name}: ${message}${stack ? '\n' + stack : ''}${extraProps}`;
    }
  
    if (typeof value === 'string') {
      return value;
    }

    try {
      return stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
}


function formatString(msg, ...rest) {

    let message = "";

    message += getString(msg);
   
    rest.forEach((restItem) => {
      message += " " + getString(restItem);
    });

    return message;

}

/*
const logFormat = (source, msg, ...rest) => {
    return {
        source,
        message: formatString(msg, ...rest)
    };
};
*/

const logFormat = (source, message, ...rest) => {
	  return [{ source: source } , formatString(message, ...rest)];
};

module.exports = logFormat;

