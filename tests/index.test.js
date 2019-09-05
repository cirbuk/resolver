import Resolver from "../src";
import math from "math-expression-evaluator";

const template = {
  path: "authenticate",
  method: "post",
  isFormData: "{{boolean}}",
  data: {
    userid: "{{email.0.email}}",
    app_name: "{{appName}}"
  }
};

const data = {
  boolean: false,
  appName: "kubric",
  email: [{
    email: "jophin4u@gmail.com"
  }],
  mapValue: ["mapper"]
};

describe("resolver", () => {
  it("resolve case", () => {
    const resolver = new Resolver();
    return expect(resolver.resolve(template, data)).toEqual({
      path: "authenticate",
      method: "post",
      isFormData: false,
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("undefined case", () => {
    const resolver = new Resolver();
    const templateUndefined = {
      ...template,
      method: "{{method}}"
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: "authenticate",
      isFormData: false,
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("replace undefined case", () => {
    const resolver = new Resolver({
      replaceUndefinedWith: "blast"
    });
    const templateUndefined = {
      ...template,
      method: "{{method}}"
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: "authenticate",
      method: "blast",
      isFormData: false,
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("mapping", () => {
    const resolver = new Resolver();
    const templateUndefined = {
      ...template,
      method: {
        _mapping: "{{mapValue.0}}",
        _transformer(value) {
          return `${value}_mapped`;
        }
      }
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: "authenticate",
      method: "mapper_mapped",
      isFormData: false,
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("mapping with custom prop names", () => {
    const resolver = new Resolver({
      fields: {
        mapping: "____mapping___",
        transformer: "___transformer___"
      }
    });
    const templateUndefined = {
      ...template,
      method: {
        ____mapping___: "{{mapValue.0}}",
        ___transformer___(value) {
          return `${value}_mapped`;
        }
      }
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: "authenticate",
      method: "mapper_mapped",
      isFormData: false,
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("instance transformer", () => {
    const resolver = new Resolver({
      transformer(key, value) {
        return key === "boolean" ? "This is true" : value;
      }
    });
    return expect(resolver.resolve(template, data)).toEqual({
      path: "authenticate",
      method: "post",
      isFormData: "This is true",
      data: {
        userid: "jophin4u@gmail.com",
        app_name: "kubric"
      }
    });
  });

  it("function transformer", () => {
    const resolver = new Resolver();
    return expect(resolver.resolve(template, data, (key, value) => key === "boolean" ? "This is true" : value))
      .toEqual({
        path: "authenticate",
        method: "post",
        isFormData: "This is true",
        data: {
          userid: "jophin4u@gmail.com",
          app_name: "kubric"
        }
      });
  });

  it("string with transformer", () => {
    const resolver = new Resolver({
      transformer(key, value) {
        return typeof value === "undefined" ? "" : `(${value})`;
      }
    });
    return expect(resolver.resolve("Ads will be published to Facebook for all ads{{generation-completed}} under this campaign"))
      .toEqual("Ads will be published to Facebook for all ads under this campaign");
  });

  it("with math transformer", () => {
    const resolver = new Resolver();
    return expect(resolver.resolve("Ads will be published to Facebook for all ads{{generation-completed}} under this campaign ([[2 * {{value}}]])", {
      "generation-completed": " completed",
      "value": "10"
    }, {
      transformMap: [["\\[\\[(.+?)\\]\\]", (match, formula) => math.eval(formula)]]
    }))
      .toEqual("Ads will be published to Facebook for all ads completed under this campaign (20)");
  });

  it("partial resolution", () => {
    const resolver = new Resolver({
      ignoreUndefined: true
    });
    return expect(resolver.resolve({
      "headers": {
        "Authorization": "Bearer {{token}}"
      },
      "host": "{{__kubric_config__.host}}",
      "path": "/api/v1"
    }, {
      "__kubric_config__": {
        host: "https://kubric.io",
        apiHost: "https://api.kubric.io",
        root: "root.kubric.io",
        cookie: "uid"
      }
    }))
      .toEqual({
        "headers": { "Authorization": "Bearer {{token}}" },
        "host": "https://kubric.io",
        "path": "/api/v1"
      });
  });

  it("Resolution to function string", () => {
    const resolver = new Resolver({
      ignoreUndefined: true
    });
    const transformers = {
      json(value) {
        return JSON.stringify(value);
      },
      default(value) {
        return value;
      }
    };
    return expect(resolver.resolve({
      "headers": { "Authorization": "Bearer {{token}}" },
      "host": "{{__kubric_config__.host}}",
      "path": "/api/v1",
      "ad": {
        "_mapping": "adData",
        "_transformer": "[[json]]"
      }
    }, {
      "__kubric_config__": {
        host: "https://kubric.io",
        apiHost: "https://api.kubric.io",
        root: "root.kubric.io",
        cookie: "uid"
      }
    }, {
      transformMap: [["\\[\\[(.+?)\\]\\]", (match, formula) => transformers[formula] || transformers['default']]]
    }))
      .toEqual({
        "headers": { "Authorization": "Bearer {{token}}" },
        "host": "https://kubric.io",
        "path": "/api/v1",
        "ad": {
          "_mapping": "adData",
          "_transformer": transformers.json.toString()
        }
      });
  });

  it("Resolution to function object", () => {
    const resolver = new Resolver({
      ignoreUndefined: true
    });
    const transformers = {
      json(value) {
        return JSON.stringify(value);
      },
      default(value) {
        return value;
      }
    };
    return expect(resolver.resolve({
      "headers": { "Authorization": "Bearer {{token}}" },
      "host": "{{__kubric_config__.host}}",
      "path": "/api/v1",
      "ad": {
        "_mapping": "{{adData}}",
        "_transformer": "[[json]]"
      }
    }, {
      "__kubric_config__": {
        host: "https://kubric.io",
        apiHost: "https://api.kubric.io",
        root: "root.kubric.io",
        cookie: "uid"
      }
    }, {
      transformMap: [[/\[\[(.+?)]]/, (match, formula) => transformers[formula] || transformers['default']]]
    }))
      .toEqual({
        "headers": { "Authorization": "Bearer {{token}}" },
        "host": "https://kubric.io",
        "path": "/api/v1",
        "ad": {
          "_mapping": "{{adData}}",
          "_transformer": transformers.json
        }
      });
  });

  it("Resolution from resolved function object", () => {
    const resolver = new Resolver({
      ignoreUndefined: true
    });
    const transformers = {
      json(value) {
        return JSON.stringify(value);
      },
      default(value) {
        return value;
      }
    };
    const fnResolvedObject = resolver.resolve({
      "headers": { "Authorization": "Bearer {{token}}" },
      "host": "{{__kubric_config__.host}}",
      "path": "/api/v1",
      "ad": {
        "_mapping": "{{adData}}",
        "_transformer": "[[json]]"
      }
    }, {
      "__kubric_config__": {
        host: "https://kubric.io",
        apiHost: "https://api.kubric.io",
        root: "root.kubric.io",
        cookie: "uid"
      }
    }, {
      transformMap: [[/\[\[(.+?)]]/, (match, formula) => transformers[formula] || transformers['default']]]
    });
    return expect(resolver.resolve(fnResolvedObject, {
      token: "345",
      adData: {
        "test": "123",
        "test2": "456"
      }
    }))
      .toEqual({
        "headers": { "Authorization": "Bearer 345" },
        "host": "https://kubric.io",
        "path": "/api/v1",
        "ad": '{"test":"123","test2":"456"}'
      });
  });

});