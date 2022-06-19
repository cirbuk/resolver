import Resolver from "../src/index";
import { isString } from "@kubric/utils";
import sanitizeHTML from "sanitize-html";

const resolver = new Resolver();
const ignoreEmptyMappingResolver = new Resolver({
  ignoreEmptyMapping: true
});

const template = {
  "h": "{{}}",
};

describe("Empty mapping tests", () => {
  it("Should resolve empty mappings", () => expect(resolver.resolve(template, {
    test: 1
  })).toEqual({
    "h": {
      test: 1
    },
  }));

  it("Should not resolve empty mappings", () => expect(ignoreEmptyMappingResolver.resolve(template, {
    test: 1
  })).toEqual({
    "h": "{{}}",
  }))
});