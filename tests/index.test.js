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

describe('Resolver', () => {
  it('resolve case', () => {
    const resolver = new Resolver();
    return expect(resolver.resolve(template, data)).toEqual({
      path: 'authenticate',
      method: 'post',
      isFormData: false,
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('undefined case', () => {
    const resolver = new Resolver();
    const templateUndefined = {
      ...template,
      method: '{{method}}',
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: 'authenticate',
      isFormData: false,
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('replace undefined case', () => {
    const resolver = new Resolver({
      replaceUndefinedWith: 'blast',
    });
    const templateUndefined = {
      ...template,
      method: '{{method}}',
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: 'authenticate',
      method: 'blast',
      isFormData: false,
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('mapping', () => {
    const resolver = new Resolver();
    const templateUndefined = {
      ...template,
      method: {
        _mapping: '{{mapValue.0}}',
        _transformer(value) {
          return `${value}_mapped`;
        },
      },
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: 'authenticate',
      method: 'mapper_mapped',
      isFormData: false,
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('mapping with custom prop names', () => {
    const resolver = new Resolver({
      fields: {
        mapping: '____mapping___',
        transformer: '___transformer___',
      },
    });
    const templateUndefined = {
      ...template,
      method: {
        ____mapping___: '{{mapValue.0}}',
        ___transformer___(value) {
          return `${value}_mapped`;
        },
      },
    };
    return expect(resolver.resolve(templateUndefined, data)).toEqual({
      path: 'authenticate',
      method: 'mapper_mapped',
      isFormData: false,
      data: {
        userid: 'jophin4u@gmail.com',
        app_name: 'kubric',
      },
    });
  });

  it('partial resolution', () => {
    const resolver = new Resolver({
      ignoreUndefined: true,
    });
    return expect(
      resolver.resolve(
        {
          headers: {
            Authorization: 'Bearer {{token}}',
          },
          host: '{{__kubric_config__.host}}',
          path: '/api/v1',
        },
        {
          __kubric_config__: {
            host: 'https://kubric.io',
            apiHost: 'https://api.kubric.io',
            root: 'root.kubric.io',
            cookie: 'uid',
          },
        }
      )
    ).toEqual({
      headers: {Authorization: 'Bearer {{token}}'},
      host: 'https://kubric.io',
      path: '/api/v1',
    });
  });

  it('should resolve with type', () => {
    const resolver = new Resolver();
    const resolved = resolver.resolve(
      {
        withinstring:
          'replacing within string once {{data.once|5}} and twice {{data.twice|2}}',
        notypedefault: '{{data.notypedefault|5}}',
        numberstring: '{{data.numberstring||number}}',
        number: '{{data.number||number}}',
        numberdefault: '{{data.numberdefault|5|number}}',
        stringnumber: '{{data.stringnumber||string}}',
        stringdefault: '{{data.stringdefault|test|string}}',
        booldefault: '{{data.booldefault|test|boolean}}',
        booltruedefault: '{{data.boolfalsedefault|true|boolean}}',
        booleanstring: '{{data.booleanstring||boolean}}',
        boolean: '{{data.boolean||boolean}}',
        array: '{{data.array|[2,3]|array}}',
        defaultarray: '{{data.defaultarray|[2,3]|array}}',
        arraystring: '{{data.defaultarray|[2,3]}}',
        object: '{{data.object|{"two": 2, "three": 3}|object}}',
        defaultobject: '{{data.defaultobject|{"two": 2, "three": 3}|object}}',
        defaultobjectstring: '{{data.defaultobject|{"two": 2, "three": 3}}}',
        objectstring: '{{data.objectstring||object}}',
        nulldefault: '{{data.nulldefault||null}}',
        null: '{{data.null||null}}',
      },
      {
        data: {
          once: 1,
          numberstring: '3',
          number: 4,
          stringnumber: 10,
          booleanstring: 'test',
          boolean: true,
          array: [1],
          object: {
            one: 1,
          },
          objectstring: '{"four":4}',
          null: 5,
        },
      }
    );
    return expect(resolved).toEqual({
      withinstring: 'replacing within string once 1 and twice 2',
      notypedefault: '5',
      numberstring: 3,
      number: 4,
      numberdefault: 5,
      stringnumber: '10',
      stringdefault: 'test',
      booldefault: false,
      booltruedefault: true,
      booleanstring: false,
      boolean: true,
      array: [1],
      defaultarray: [2, 3],
      arraystring: '[2,3]',
      defaultobjectstring: '{"two": 2, "three": 3}',
      defaultobject: {
        two: 2,
        three: 3,
      },
      object: {
        one: 1,
      },
      objectstring: {
        four: 4,
      },
      nulldefault: null,
      null: 5,
    });
  });

  it('should resolve readme example 1', () => {
    const data = {
      isFormData: false,
      appName: 'an_app',
      email: [
        {
          id: 'abc@gmail.com',
        },
      ],
      mapValue: {
        data: {
          name: 'tester',
          id: 1234,
        },
      },
    };

    const template = {
      method: 'post',
      isFormData: '{{isFormData}}',
      userId: 'userid_{{mapValue.data.id}}',
      data: {
        userid: '{{email.0.id}}',
        app_name: '{{appName}}',
      },
      extraData: '{{mapValue.data}}',
    };

    const resolver = new Resolver();
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual({
      method: 'post',
      isFormData: false,
      userId: 'userid_1234',
      data: {
        userid: 'abc@gmail.com',
        app_name: 'an_app',
      },
      extraData: {
        name: 'tester',
        id: 1234,
      },
    });
  });

  it('should resolve readme example 2', () => {
    const data = {};

    const template = {
      method: 'post',
      isFormData: '{{isFormData|false}}',
      userId: 'userid_{{mapValue.data.id|1234}}',
      data: {
        userid: '{{email.0.id|abc@gmail.com}}',
        app_name: '{{appName|an_app}}',
      },
    };

    const resolver = new Resolver();
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual({
      method: 'post',
      isFormData: 'false',
      userId: 'userid_1234',
      data: {
        userid: 'abc@gmail.com',
        app_name: 'an_app',
      },
    });
  });

  it('should resolve mappings inside mappings 1', () => {
    const data = {
      index: {
        value: 2,
      },
      array: ['one', 'two', 'three'],
    };

    const template = {
      string: '{{array.{{index.value}}}}',
    };

    const resolver = new Resolver();
    return expect(resolver.resolve(template, data)).toEqual({
      string: 'three',
    });
  });

  it('should resolve mappings inside mappings 2', () => {
    const data = {
      index: {
        value: 2,
      },
      array: ['one', 'two', 'three'],
    };

    const template = {
      string:
        'This is a string {{array.{{index.value}}}} that has a mapping in a mapping',
    };

    const resolver = new Resolver();
    return expect(resolver.resolve(template, data)).toEqual({
      string: 'This is a string three that has a mapping in a mapping',
    });
  });
});
