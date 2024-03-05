import { BaseParser } from "../BaseParser";

const variableNameCapturePattern = /([^,)]*)/;
const defaultValueCapturePattern = /(?:[^),]*|{[^}]*})/;

const supportedMethods = ["useDVCVariable", "useVariable", "useVariableValue"]
  .map((m) => `(?:${m}\\(\\s*)`)
  .join("|");

export class ReactParser extends BaseParser {
  identity = "react";
  matchClientName = false;
  variableMethodPattern = new RegExp(`(?:${supportedMethods})`);
  orderedParameterPatterns = [
    variableNameCapturePattern,
    defaultValueCapturePattern,
  ];

  commentCharacters = ["//", "/*", "{/*"];
}
