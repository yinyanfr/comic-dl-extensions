import JSON5 from "json5";

const packedArguments =
  /\}\s*\(\s*('(?:\\.|[^'\\])*')\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*('(?:\\.|[^'\\])*')\.split\('\|'\)/s;
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function unpack(script: string) {
  const match = packedArguments.exec(script);
  if (!match) {
    return script;
  }
  const [, payload, baseText, countText, symbols] = match;
  const base = Number(baseText);
  const count = Number(countText);
  const dictionary = (JSON5.parse(symbols) as string).split("|");
  if (base < 2 || base > alphabet.length || count !== dictionary.length) {
    throw new Error("Invalid Dm5 reader script dictionary");
  }
  return (JSON5.parse(payload) as string).replace(/\b[a-z0-9]+\b/gi, (word) => {
    let index = 0;
    for (const char of word) {
      const digit = alphabet.indexOf(char);
      index = index * base + digit;
      if (digit >= base || index >= count) {
        return word;
      }
    }
    return dictionary[index] || word;
  });
}

export function parseReaderImage(response: string) {
  // The response is a script. Decode its data without running site code.
  const script = unpack(response);
  const path = /\bvar\s+pvalue\s*=\s*\[\s*(['"])([^'"\r\n]+)\1/.exec(
    script,
  )?.[2];
  const prefix = /\bvar\s+pix\s*=\s*(['"])([^'"\r\n]+)\1/.exec(script)?.[2];
  const suffix =
    /\bpix\s*\+\s*pvalue\s*\[\s*\w+\s*\]\s*\+\s*(['"])(\?[^'"\r\n]*)\1/.exec(
      script,
    )?.[2];
  if (!prefix || !path) {
    throw new Error("Dm5 reader did not return an image URL");
  }
  return `${prefix}${path}${suffix ?? ""}`;
}
