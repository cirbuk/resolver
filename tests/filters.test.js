import {isString} from '@kubric/utils';
import sanitizeHTML from 'sanitize-html';
import Resolver from '../src/index';

const resolver = new Resolver({
  filters: [/^{{__config/],
});

const template1 = {
  path: '/api/v1',
  resources: {
    discounts: {
      host: '{{__config.hosts.discount}}',
      path: 'scrooge/discounts/bulk',
      services: {
        update: {
          method: 'put',
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
        path: 'scrooge/discounts/bulk',
        services: {
          update: {
            method: 'put',
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
