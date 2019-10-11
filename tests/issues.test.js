import Resolver from "../src";
import math from "math-expression-evaluator";
import _ from "lodash";

describe("Resolver issues", () => {
  it("Issue with template having function being resolved to empty object", () => {
    const resolver = new Resolver();
    const resolvedData = resolver.resolve([
      "{{req._sessionData}}",
      () => ({
        test: 35
      })
    ], {
      req: {
        _sessionData: {
          data: "session"
        }
      }
    });
    const results = resolvedData.reduce((acc, dataPart = {}) => ({
      ...acc,
      ...(_.isFunction(dataPart) ? dataPart() : dataPart)
    }), {});
    return expect(results).toEqual({
      data: "session",
      test: 35
    });
  });
});