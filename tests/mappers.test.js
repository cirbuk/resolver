import math from 'math-expression-evaluator';
import {get} from '@kubric/utils';
import Resolver from '../src';

describe('Mappers tests', () => {
  it('resolution to function object', () => {
    const resolver = new Resolver({
      ignoreUndefined: true,
    });
    const transformers = {
      json(value) {
        return JSON.stringify(value);
      },
      default(value) {
        return value;
      },
    };
    const resolvedData = resolver.resolve(
      {
        headers: {Authorization: 'Bearer {{token}}'},
        host: '{{__kubric_config__.host}}',
        path: '/api/v1',
        ad: {
          _mapping: '{{adData}}',
          _transformer: '[[json]]',
        },
      },
      {
        __kubric_config__: {
          host: 'https://kubric.io',
          apiHost: 'https://api.kubric.io',
          root: 'root.kubric.io',
          cookie: 'uid',
        },
      },
      {
        mappers: [
          [
            /\[\[(.+?)]]/,
            (match, formula) => transformers[formula] || transformers.default,
          ],
        ],
      }
    );
    return expect(
      typeof resolvedData.ad._transformer === 'function' &&
        resolvedData.ad._transformer === transformers.json
    ).toEqual(true);
  });

  it('resolution from resolved function object', () => {
    const resolver = new Resolver({
      ignoreUndefined: true,
    });
    const transformers = {
      json(value) {
        return JSON.stringify(value);
      },
      default(value) {
        return value;
      },
    };
    const fnResolvedObject = resolver.resolve(
      {
        headers: {Authorization: 'Bearer {{token}}'},
        host: '{{__kubric_config__.host}}',
        path: '/api/v1',
        ad: {
          _mapping: '{{adData}}',
          _transformer: '[[json]]',
        },
      },
      {
        __kubric_config__: {
          host: 'https://kubric.io',
          apiHost: 'https://api.kubric.io',
          root: 'root.kubric.io',
          cookie: 'uid',
        },
      },
      {
        mappers: [
          [
            /\[\[(.+?)]]/,
            (match, formula) => transformers[formula] || transformers.default,
          ],
        ],
      }
    );
    return expect(
      resolver.resolve(fnResolvedObject, {
        token: '345',
        adData: {
          test: '123',
          test2: '456',
        },
      })
    ).toEqual({
      headers: {Authorization: 'Bearer 345'},
      host: 'https://kubric.io',
      path: '/api/v1',
      ad: '{"test":"123","test2":"456"}',
    });
  });

  it('should resolve readme example 3', () => {
    const data = {
      val1: '1',
      val2: '2',
      val3: '3',
      val4: '4',
    };

    const evaluators = {
      math: (match, formula) => {
        try {
          return +math.eval(formula);
        } catch (ex) {
          return match;
        }
      },
    };

    const template = {
      calculatedStringValue:
        '[[{{val1}} + {{val2}}]] and [[{{val3}} + {{val4}}]]',
      calculatedNumberValue: '[[{{val1}} + {{val4}}]]',
    };

    const resolver = new Resolver({
      mappers: [[/\[\[(.+?)]]/g, evaluators.math]],
    });
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual({
      calculatedStringValue: '3 and 7',
      calculatedNumberValue: 5,
    });
  });

  it('Mapper should be passed with data object and should resolve from it', () => {
    const data = {
      quiz: {
        fields: {
          entries: [
            {
              question: {
                variables: {
                  textInputWidth: '100px',
                  verticalPadding: '20px',
                },
              },
            },
          ],
        },
      },
    };

    const template =
      '[data-mm-select-option="true"],[data-mm-multi-select-option="true"] {border: 3px solid transparent !important;max-width: [[quiz.fields.entries.0.question.variables.textInputWidth]];padding: {{quiz.fields.entries.0.question.variables.verticalPadding}} !important;}';

    const resolver = new Resolver({
      mappers: [
        [
          /\[\[(.+?)]]/g,
          (match, dataPath, data) => {
            try {
              return get(data, dataPath);
            } catch (ex) {
              return match;
            }
          },
        ],
      ],
    });
    const resolvedData = resolver.resolve(template, data);
    return expect(resolvedData).toEqual(
      '[data-mm-select-option="true"],[data-mm-multi-select-option="true"] {border: 3px solid transparent' +
        ' !important;max-width: 100px;padding: 20px !important;}'
    );
  });
});
