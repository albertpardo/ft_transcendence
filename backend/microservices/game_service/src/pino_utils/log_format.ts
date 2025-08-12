import stringify from 'safe-stable-stringify';

function getString(value : unknown): string {

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


function formatString(msg: unknown, ...rest: unknown[]): string {

    let message: string = "";

    message += getString(msg);
   
    rest.forEach((restItem) => {
      message += " " + getString(restItem);
    });

    return message;

}

/*
export const logFormat = (source: string, msg: unknown, ...rest: unknown[]): { source: string; message: string } => {
    return {
        source,
        message: formatString(msg, ...rest)
    };
};
*/


export const logFormat = (source: string, message: unknown, ...rest: unknown[]): [object, string ] => {
    return [{ source: source } , formatString(message, ...rest)];
};
