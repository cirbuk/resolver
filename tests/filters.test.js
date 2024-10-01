import {isString} from '@kubric/utils';
import sanitizeHTML from 'sanitize-html';
import Resolver from '../src/index';

const resolver = new Resolver({
  filters: [/^__config/],
});

const template1 = {
  path: '/api/v1',
  resources: {
    discounts: {
      host: '{{__config.hosts.discount}}',
      services: {
        update: {
          method: 'put',
          path: '/admin/api/{{__config.version}}',
          data: {
            store: '{{store}}',
            discount_ids_map: '{{discountMeta.discount_ids_map|{}|object}}',
            collection_ids: '{{discountMeta.collection_ids|[]|array}}',
            applies_to_collection_ids:
              '{{discountMeta.applies_to_collection_ids|[]|array}}',
          },
        },
      },
    },
  },
};

test('filters test', () =>
  expect(
    resolver.resolve(template1, {
      __config: {
        version: 'v2',
        hosts: {
          discount: 'discounthost',
        },
      },
    })
  ).toEqual({
    path: '/api/v1',
    resources: {
      discounts: {
        host: 'discounthost',
        services: {
          update: {
            method: 'put',
            path: '/admin/api/v2',
            data: {
              store: '{{store}}',
              discount_ids_map: '{{discountMeta.discount_ids_map|{}|object}}',
              collection_ids: '{{discountMeta.collection_ids|[]|array}}',
              applies_to_collection_ids:
                '{{discountMeta.applies_to_collection_ids|[]|array}}',
            },
          },
        },
      },
    },
  }));
