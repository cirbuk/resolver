import {
  get,
  isFunction,
  isNull,
  isString,
  isUndefined,
  mapValues,
  isValidString,
  isPlainObject,
} from '@kubric/utils';
import {
  ResolveFunctionOptions,
  ResolverOptions,
  MappersType,
  TransformerFunction,
  MapperTransformerType,
} from './types';

export default class Resolver {
  mappingField: string;

  replaceUndefinedWith?: unknown;

  transformerField: string;

  transformer?: TransformerFunction;

  mappers?: MappersType;

  ignoreUndefined?: boolean;

  delimiter: string;

  overrideDefault: boolean;

  ignoreEmptyMapping: boolean;

  filters?: RegExp[];

  constructor({
    replaceUndefinedWith,
    ignoreUndefined = false,
    transformer,
    mappers,
    fields = {
      mapping: '_mapping',
      transformer: '_transformer',
    },
    delimiter = '|',
    overrideDefault = false,
    ignoreEmptyMapping = false,
    filters = [],
  }: ResolverOptions = {}) {
    this.replaceUndefinedWith = replaceUndefinedWith;
    this.ignoreEmptyMapping = ignoreEmptyMapping;
    if (isUndefined(this.replaceUndefinedWith)) {
      this.ignoreUndefined = ignoreUndefined;
    }
    this.transformer = transformer;
    this.mappers = Resolver._processMappers(mappers);
    const {mapping: mappingField, transformer: transformerField} = fields;
    this.mappingField = isValidString(mappingField)
      ? (mappingField as string)
      : '_mapping';
    this.transformerField = isValidString(transformerField)
      ? (transformerField as string)
      : '_transformer';
    this.delimiter = delimiter;
    this.overrideDefault = overrideDefault;
    this.filters = filters;
  }

  _getTransformedResult(
    dataKey: string,
    value: unknown,
    propName: string,
    path: string,
    transformer: TransformerFunction | undefined,
    match: string
  ): unknown {
    if (this.ignoreEmptyMapping && !isValidString(dataKey)) {
      value = match;
    } else if (isUndefined(value)) {
      value = this.ignoreUndefined ? match : this.replaceUndefinedWith;
    }
    transformer = transformer || this.transformer;
    return isFunction(transformer)
      ? transformer(value, dataKey, propName, path, match)
      : value;
  }

  static _resolveMappers(
    srcStr: string,
    data: any,
    mappers: MappersType = []
  ): string {
    return mappers.reduce((accStr, [regex, transformer]) => {
      if (!isString(accStr)) {
        return accStr;
      }
      const regexp = regex as RegExp;
      const trans = transformer as MapperTransformerType;
      regexp.lastIndex = 0;
      const results = regexp.exec(accStr);
      if (isNull(results)) {
        return accStr;
      }
      if (results[0] !== accStr) {
        return accStr.replace(regexp, (...args) =>
          trans(args[0], args[1], data, ...args.slice(2))
        );
      }
      return trans(...results);
    }, srcStr);
  }

  _getValue(
    data: unknown,
    dataKey = ''
  ): {
    key: string;
    value: unknown;
  } {
    const [key, defaultValue, type = ''] = dataKey.split(this.delimiter);
    let finalDefaultValue: unknown = defaultValue;
    if (type === 'null') {
      finalDefaultValue = null;
    }
    let value = get(
      data,
      key,
      isValidString(finalDefaultValue) || isNull(finalDefaultValue)
        ? finalDefaultValue
        : undefined
    );
    if (this.ignoreUndefined && isUndefined(value)) {
      value = undefined;
    } else if (type.length > 0) {
      if (type === 'number') {
        value = +(value as string);
      } else if (type === 'string') {
        value = `${value}`;
      } else if (type === 'boolean') {
        value = typeof value === 'boolean' ? value : value === 'true';
      } else if (type === 'array') {
        value = Array.isArray(value) ? value : JSON.parse(value as string);
      } else if (type === 'object') {
        value = isPlainObject(value) ? value : JSON.parse(value as string);
      }
    }
    return {
      key,
      value,
    };
  }

  _resolveString(
    str: string,
    data: unknown,
    propName: string,
    path = '',
    {
      transformer,
      mappers = [],
      overrideDefault = false,
      filters = [],
    }: ResolveFunctionOptions = {}
  ): unknown {
    overrideDefault = overrideDefault || this.overrideDefault;
    transformer = transformer || this.transformer;
    mappers = mappers || this.mappers;
    filters = filters.length > 0 ? filters : this.filters ?? [];
    const resolve = (str: string, data: unknown, isFirst = true): string => {
      const regex = /{{|}}/g;
      let statusFlag = 0;
      let start = 0;
      let result = regex.exec(str);
      let done = false;
      while (result !== null) {
        const [match] = result;
        if (statusFlag === 0) {
          start = result.index;
        }
        if (match === '{{') {
          statusFlag += 1;
        } else if (match === '}}' && statusFlag > 0) {
          statusFlag -= 1;
        } else {
          statusFlag = -1;
        }
        if (statusFlag === 0) {
          const chunkToReplace = str.substring(start + 2, regex.lastIndex - 2);
          const replaced = resolve(chunkToReplace, data, false);
          if (start === 0 && regex.lastIndex === str.length) {
            str = replaced as string;
            done = true;
          } else {
            let newStr = `${str.substring(0, start)}${replaced}`;
            const nextSearchIndex = newStr.length;
            newStr = `${newStr}${str.substring(regex.lastIndex)}`;
            regex.lastIndex = nextSearchIndex;
            str = newStr;
          }
        }
        result = !done ? regex.exec(str) : null;
      }
      if (!isFirst) {
        const {value: untransformedValue, key} = this._getValue(data, str);
        return this._getTransformedResult(
          key,
          untransformedValue,
          propName,
          path.replace(/^./, ''),
          transformer,
          `{{${str}}}`
        ) as string;
      }
      return str;
    };
    const shouldResolve =
      filters.length === 0 || filters.some((filter) => filter.test(str));
    let finalValue =
      shouldResolve && !overrideDefault ? resolve(str, data) : str;
    if (mappers.length > 0) {
      finalValue = Resolver._resolveMappers(finalValue, data, mappers);
    }

    return finalValue;
  }

  _resolveArray(
    templateArr: unknown[],
    data: unknown,
    path = '',
    options?: ResolveFunctionOptions
  ): unknown[] {
    return templateArr.map((value, index) =>
      this._resolveTemplate(
        value,
        data,
        `${index}`,
        `${path}.${index}`,
        options
      )
    );
  }

  _resolveObject(
    template: Record<string, unknown>,
    data: unknown,
    path = '',
    options?: ResolveFunctionOptions
  ): Record<string, unknown> {
    return mapValues(template, (value: unknown, propName) =>
      this._resolveTemplate(
        value,
        data,
        propName,
        `${path}.${propName}`,
        options
      )
    );
  }

  static _processMappers(mappers: MappersType = []): MappersType {
    return mappers.reduce((acc, [regex, transformer]) => {
      if (!isFunction(transformer)) {
        return acc;
      }
      if (isString(regex)) {
        return [...acc, [new RegExp(regex as string, 'g'), transformer]];
      }
      if (regex.constructor === RegExp) {
        return [...acc, [regex, transformer]];
      }
      return acc;
    }, [] as MappersType);
  }

  resolve(
    template: unknown,
    data?: unknown,
    options: ResolveFunctionOptions | TransformerFunction = {}
  ): any {
    if (isFunction(options)) {
      options = {
        transformer: options,
      } as ResolveFunctionOptions;
    } else {
      const {mappers, ...rest} = options as ResolveFunctionOptions;
      options = {
        ...rest,
        mappers: mappers ? Resolver._processMappers(mappers) : this.mappers,
      };
    }
    return this._resolveTemplate(template, data, '', '', options);
  }

  _resolveTemplate(
    template: unknown,
    data: unknown,
    propName: string,
    path = '',
    options?: ResolveFunctionOptions
  ): unknown {
    if (Array.isArray(template)) {
      return this._resolveArray(template, data, path, options);
    }
    if (isString(template)) {
      return this._resolveString(template, data, propName, path, options);
    }
    if (isPlainObject(template)) {
      const temp = template as Record<string, unknown>;
      const mappingString = temp[this.mappingField];
      const mappingTransformer = temp[this.transformerField];
      if (
        Object.keys(temp).length === 2 &&
        mappingString &&
        mappingTransformer &&
        isFunction(mappingTransformer)
      ) {
        return this._resolveTemplate(mappingString, data, propName, path, {
          ...options,
          transformer: mappingTransformer,
        });
      }
      return this._resolveObject(temp, data, path, options);
    }
    return template;
  }

  /**
   * Parses the template and returns true if it has at least 1 mapping. Returns as soon as a mapping is found.
   */
  static hasAnyMapping(template: unknown): boolean {
    let hasMapping = false;
    const resolver = new Resolver({
      transformer(): void {
        hasMapping = true;
      },
    });
    if (isValidString(template)) {
      resolver.resolve(template);
    } else if (Array.isArray(template)) {
      return template.some((e) => Resolver.hasAnyMapping(e));
    } else if (isPlainObject(template)) {
      const temp = template as Record<string, unknown>;
      return Object.keys(temp).some((key) => Resolver.hasAnyMapping(temp[key]));
    }
    return hasMapping;
  }
}

export type {
  ResolverOptions,
  ResolveFunctionOptions,
  TransformerFunction,
} from './types';
