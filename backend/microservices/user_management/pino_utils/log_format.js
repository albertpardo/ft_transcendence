const stringify = require('safe-stable-stringify');

function formatString(msg) {
  if (typeof msg === 'string') {
    return msg;
  }

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

module.exports = logFormat;

