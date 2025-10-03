import Resolver from '../src';

describe('number_n_decimal type', () => {
  it('converts number to fixed decimals as string', () => {
    const resolver = new Resolver();
    const template = {
      price: '{{price||number_2_decimal}}',
    };
    const data = {price: 2};
    expect(resolver.resolve(template, data)).toEqual({price: '2.00'});
  });

  it('converts numeric string to fixed decimals as string', () => {
    const resolver = new Resolver();
    const template = {
      price: '{{price||number_3_decimal}}',
    };
    const data = {price: '2'};
    expect(resolver.resolve(template, data)).toEqual({price: '2.000'});
  });

  it('uses default then converts to fixed decimals as string', () => {
    const resolver = new Resolver();
    const template = {
      price: '{{price|3.456|number_2_decimal}}',
    };
    const data = {};
    expect(resolver.resolve(template, data)).toEqual({price: '3.46'});
  });

  it('leaves value unchanged if not a number after coercion', () => {
    const resolver = new Resolver();
    const template = {
      price: '{{price||number_2_decimal}}',
    };
    const data = {price: 'abc'};
    expect(resolver.resolve(template, data)).toEqual({price: 'abc'});
  });
});
