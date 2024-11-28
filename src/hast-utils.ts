import {LayoutElement, LayoutRoot} from "./types.js";

export const quoteCustomCodes: { [key: string]: string } = {
  single: "{$sqc0}",
  double: "{$dqc0}",
  without: "{$without0}",
};

export enum QuotesTypes {
  single = "single",
  double = "double",
}

export const getQuotesType = (str: string, rootString: string) => {
  const startIndex = rootString.indexOf(str);
  if(startIndex === -1) return QuotesTypes.double;

  const bracket = rootString[startIndex - 1];
  if (!bracket || !bracket.trim() || !str) {
    return "";
  } else {
    return bracket === `'` ? QuotesTypes.single : QuotesTypes.double;
  }
};

const objectToHast = (rootString: string, obj: Object, options: {type?: string | undefined}) => {
  const {type = "element"} = options;

  const frontmatterObjectToHastRecursive: any = (frontmatterValue: any, frontmatterType: string, rootString: string) => {

    const isSeq: boolean = Array.isArray(frontmatterValue);
    const isMap: boolean = isPlainObject(frontmatterValue);

    if (isMap) {
      return {
        type: frontmatterType,
        tagName: "table",
        children: [
          {
            type: "element",
            tagName: "tbody",
            children: getPropertiesInFrontmatterObj(
              frontmatterValue,
              frontmatterObjectToHastRecursive,
              rootString,
              frontmatterType
            ),
            properties: {},
          },
        ],
        properties: {},
      }
    } else if (isSeq) {
      return {
        type: "element",
        tagName: "ul",
        children: frontmatterValue.map((value: any) => {
          return {
            type: "element",
            tagName: "li",
            children: [
              {
                type: "element",
                tagName: "p",
                children: [frontmatterObjectToHastRecursive(value, frontmatterType, rootString)],
                properties: {},
              }
            ],
            properties: {},
          };
        }),
        properties: {}
      }
    } else {
      return {
        type: "text",
        value: frontmatterValue,
      };
    }
  };

  const hast: LayoutElement = frontmatterObjectToHastRecursive(obj, type, rootString);

  return {
    type: "root",
    children: [hast]
  } as LayoutRoot;
}

const getPropertiesInFrontmatterObj = (
  frontmatter: any,
  stringToAstRecursive: any,
  rootString: string,
  frontmatterType: string
) => {
  const children = [];
  for (let key in frontmatter) {
    if (frontmatter.hasOwnProperty(key)) {
      const rowKey = stringToAstRecursive(key);
      const rowValue = stringToAstRecursive(frontmatter[key], frontmatterType, rootString);

      let frontmatterValueProperties: any = { type: frontmatterType + "Value" };

      if (rowValue.type === "text") {
        rowValue.value = rowValue.value.toString();

        const quotes = getQuotesType(rowValue.value, rootString);
        if (quotes) frontmatterValueProperties = { ...frontmatterValueProperties, quotes };
      }

      const value = {
        type: "element",
        tagName: "tr",
        children: [
          {
            type: "element",
            tagName: "td",
            children: [rowKey],
            properties: {},
          },
          {
            type: "element",
            tagName: "td",
            children: [rowValue],
            properties: frontmatterValueProperties,
          },
        ],
        properties: {},
      };
      children.push(value);
    }
  }
  return children;
}

const isPlainObject = function (obj: Object): boolean {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

const hastToObject = (
  rootAst: LayoutRoot,
  options: {isCustomQuotes?: boolean | undefined}
): {} => {
  const {isCustomQuotes} = options;

  const hastToObjectRecursive = (hast: any, options: any = {}): any => {
    const {
      isBool = false,
      isNumber = false
    } = options;

    let result: any;
    const isTableTag = hast?.tagName === "table";
    const isRoot = hast?.type === "root";

    if(isRoot){
      const table = hast?.children[0];
      return hastToObjectRecursive(table);
    } else if (isTableTag) {
      const tbody = hast?.children[0];
      result = tbody.children.reduce((result: {}, value: LayoutElement) => {
        return { ...result, ...hastToObjectRecursive(value) };
      }, {});
    } else if (["ul", "li"].includes(hast?.tagName)) {
      const children = hast.children.map((value: LayoutElement) => {
        const firstChild = value.children[0];
        const properties = "properties" in firstChild && firstChild.properties;

        return hastToObjectRecursive(
          value.tagName === "li" ?
            ("children" in firstChild ? firstChild.children[0] : firstChild) : value,
          {...properties}
        );
      });
      result = hast?.tagName === "li" ? children[0] : children;
    } else if (hast?.tagName === "tr") {
      const [key, value] = hast.children;
      const [keyChild] = key.children;
      const [valueChild] = value.children;

      const isValueChildNumber = !isNaN(Number(valueChild.value));
      if (isValueChildNumber) valueChild.value = Number(valueChild.value);

      if(isCustomQuotes) {
        const quotes = value?.properties?.quotes;
        if (quotes && valueChild.value && quoteCustomCodes[quotes]) {
          valueChild.value =
            quoteCustomCodes[quotes] +
            valueChild.value +
            quoteCustomCodes[quotes];
        } else if (valueChild.value) {
          valueChild.value =
            quoteCustomCodes.without +
            valueChild.value +
            quoteCustomCodes.without;
        }
      }
      result = { [keyChild.value]: hastToObjectRecursive(valueChild) };
    } else if (hast?.type === "text") {
      result = isBool ?
        (hast.value === "true") :
        (isNumber ? Number(hast.value): hast.value);

    }
    return result;
  };

  return  hastToObjectRecursive(rootAst);
};

export const hastTableUtils: {
  objectToHast: (
    rootString: string,
    obj: {},
    options: { type?: string | undefined }
  ) => LayoutRoot
  hastToObject: (
    hast: LayoutRoot,
    options: { isCustomQuotes?: boolean | undefined }
  ) => {}
} = {
  objectToHast,
  hastToObject
}
