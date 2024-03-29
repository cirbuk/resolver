import math from 'math-expression-evaluator';
import Resolver from '../src';

const template = {
  path: 'authenticate',
  method: 'post',
  isFormData: '{{boolean}}',
  data: {
    userid: '{{email.0.email}}',
    app_name: '{{appName}}',
  },
};

const data = {
  boolean: false,
  appName: 'kubric',
  email: [
    {
      email: 'jophin4u@gmail.com',
    },
  ],
  mapValue: ['mapper'],
};

describe('transformer cases', () => {
  it('instance transformer', () => {
    const resolver = new Resolver({
      transformer(value, key) {
        return key === 'boolean' ? 'This is true' : value;
      },
    });
    return expect(resolver.resolve(template, data)).toEqual({
      path: 'authenticate',
      method: 'post',
      isFormData: 'This is true',
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('function transformer', () => {
    const resolver = new Resolver();
    return expect(
      resolver.resolve(template, data, (value, key) =>
        key === 'boolean' ? 'This is true' : value
      )
    ).toEqual({
      path: 'authenticate',
      method: 'post',
      isFormData: 'This is true',
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('string with transformer', () => {
    const resolver = new Resolver({
      transformer(value, key) {
        return typeof value === 'undefined' ? '' : `(${value})`;
      },
    });
    return expect(
      resolver.resolve(
        'Ads will be published to Facebook for all ads{{generation-completed}} under this campaign'
      )
    ).toEqual(
      'Ads will be published to Facebook for all ads under this campaign'
    );
  });

  it('with math transformer', () => {
    const resolver = new Resolver();
    return expect(
      resolver.resolve(
        'Ads will be published to Facebook for all ads{{generation-completed}} under this campaign ([[2 * {{value}}]])',
        {
          'generation-completed': ' completed',
          value: '10',
        },
        {
          mappers: [
            ['\\[\\[(.+?)\\]\\]', (match, formula) => math.eval(formula)],
          ],
        }
      )
    ).toEqual(
      'Ads will be published to Facebook for all ads completed under this campaign (20)'
    );
  });

  it('should call only mapping transformer', () => {
    const data = {
      value: 3,
    };

    const template = {
      value: {
        _mapping: '{{value}}',
        _transformer(value) {
          return `The value ${value} transformed by the mapping transformer`;
        },
      },
    };

    const resolver = new Resolver({
      transformer(value, mapping) {
        if (mapping === 'value') {
          return `The value ${value} transformed by the global transformer`;
        }
      },
    });
    const resolvedData = resolver.resolve(template, data, {
      transformer(value, mapping) {
        if (mapping === 'value') {
          return `The value ${value} transformed by the function transformer`;
        }
      },
    });
    return expect(resolvedData).toEqual({
      value: `The value 3 transformed by the mapping transformer`,
    });
  });

  it('should call only function transformer', () => {
    const data = {
      value: 3,
    };

    const template = {
      value: '{{value}}',
    };

    const resolver = new Resolver({
      transformer(value, mapping) {
        if (mapping === 'value') {
          return `The value ${value} transformed by the global transformer`;
        }
      },
    });
    const resolvedData = resolver.resolve(template, data, {
      transformer(value, mapping) {
        if (mapping === 'value') {
          return `The value ${value} transformed by the function transformer`;
        }
      },
    });
    return expect(resolvedData).toEqual({
      value: `The value 3 transformed by the function transformer`,
    });
  });

  it('should call global transformer', () => {
    const data = {
      value: 3,
    };

    const template = {
      value: '{{value}}',
    };

    const resolver = new Resolver({
      transformer(value, mapping) {
        if (mapping === 'value') {
          return `The value ${value} transformed by the global transformer`;
        }
      },
    });
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual({
      value: `The value 3 transformed by the global transformer`,
    });
  });

  it('should call global transformer with original match in the 5th argument', () => {
    const template = {
      value: '{{value|0|number}}',
    };

    const resolver = new Resolver({
      transformer(...args) {
        const {4: mapping} = args;
        if (mapping === template.value) {
          return `The original mapping ${mapping} is returned by the global transformer`;
        }

        return false;
      },
    });
    const resolvedData = resolver.resolve(template, {});
    return expect(resolvedData).toEqual({
      value: `The original mapping {{value|0|number}} is returned by the global transformer`,
    });
  });

  it('should pass property name to transformer', () => {
    const data = {
      value: 3,
    };

    const template = {
      property: '{{value}}',
      test: {
        property2: '{{value}}',
      },
    };

    const resolver = new Resolver({
      transformer(value, mapping, propName) {
        return propName;
      },
    });
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual({
      property: 'property',
      test: {
        property2: 'property2',
      },
    });
  });
  it('should pass paths to transformer', () => {
    const data = {
      value: 3,
    };

    const template = {
      prop1: '{{value}}',
      test: {
        prop2: '{{value}}',
      },
      array: ['{{value}}'],
      objArray: [
        {
          hello: 'test',
        },
        {
          nestedArray: [
            {
              prop3: '{{value}}',
            },
          ],
        },
      ],
    };
    const receivedSet = {};
    const resolver = new Resolver({
      transformer(value, mapping, propName, path) {
        receivedSet[propName] = path;
      },
    });
    resolver.resolve(template, data);
    return expect(receivedSet).toEqual({
      prop1: 'prop1',
      prop2: 'test.prop2',
      0: 'array.0',
      prop3: 'objArray.1.nestedArray.0.prop3',
    });
  });
});
