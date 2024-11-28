import {quoteCustomCodes} from "./hast-utils.js";

export const replaceCustomQuotes = (str: string): string => {

  const quotesMap: string[][] = [
    [`'${quoteCustomCodes.without}`, ``],
    [`${quoteCustomCodes.without}'`, ``],
    [`"${quoteCustomCodes.without}`, ``],
    [`${quoteCustomCodes.without}"`, ``],
    [`${quoteCustomCodes.without}`, ``],

    [`"${quoteCustomCodes.double}`, `"`],
    [`${quoteCustomCodes.double}"`, `"`],
    [`'${quoteCustomCodes.double}`, `"`],
    [`${quoteCustomCodes.double}'`, `"`],
    [`${quoteCustomCodes.double}`, ``],

    [`'${quoteCustomCodes.single}`, `'`],
    [`${quoteCustomCodes.single}'`, `'`],
    [`"${quoteCustomCodes.single}`, `'`],
    [`${quoteCustomCodes.single}"`, `'`],
    [`${quoteCustomCodes.single}`, `'`],
  ];

  for (const [key, value] of quotesMap) {
    str = str.replaceAll(key, value);
  }
  return  str;
};
