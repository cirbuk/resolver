import Resolver from '../src/index';

describe('Resolver.hasAnyMapping tests', () => {
  it('hasMapping false for undefined', () =>
    expect(Resolver.hasAnyMapping(undefined)).toEqual(false));
  it('hasMapping false for non mapping string', () =>
    expect(Resolver.hasAnyMapping('test')).toEqual(false));
  it('hasMapping true for mapping string', () =>
    expect(Resolver.hasAnyMapping('{{test}}')).toEqual(true));
  it('hasMapping false for non-mapped object', () =>
    expect(
      Resolver.hasAnyMapping({
        test: 'test',
      })
    ).toEqual(false));
  it('hasMapping true for mapped object', () =>
    expect(
      Resolver.hasAnyMapping({
        test: '{{test}}',
      })
    ).toEqual(true));
  it('hasMapping false for non-mapped object with array', () =>
    expect(
      Resolver.hasAnyMapping({
        test: 'test',
        arr: ['1', '2', '3'],
      })
    ).toEqual(false));
  it('hasMapping true for mapped object with mapping in array', () =>
    expect(
      Resolver.hasAnyMapping({
        test: 'test',
        arr: ['1', '2', '{{test}}'],
      })
    ).toEqual(true));
  it('hasMapping true for mapped object with expandable entries', () =>
    expect(
      Resolver.hasAnyMapping({
        test: '{{deals}}',
        arr: ['1', '2', '{{product.title}}'],
      })
    ).toEqual(true));
  it('hasMapping true for mapped object with expandable and non-expandable entries', () =>
    expect(
      Resolver.hasAnyMapping({
        test: '{{deals.0.title}}',
        arr: ['1', '2', '{{product.title}}'],
      })
    ).toEqual(true));
});
