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
  }

  _getTransformedResult(
    dataKey: string,
    value: unknown,
    propName: string,
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
      ? transformer(value, dataKey, propName)
      : value;
  }

  static _resolveMappers(srcStr: string, mappers: MappersType = []): string {
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
        return accStr.replace(regexp, trans);
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
    {
      transformer,
      mappers = [],
      overrideDefault = false,
    }: ResolveFunctionOptions = {}
  ): unknown {
    overrideDefault = overrideDefault || this.overrideDefault;
    transformer = transformer || this.transformer;
    mappers = mappers || this.mappers;
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
          transformer,
          `{{${str}}}`
        ) as string;
      }
      return str;
    };
    let finalValue = !overrideDefault ? resolve(str, data) : str;
    if (mappers.length > 0) {
      finalValue = Resolver._resolveMappers(finalValue, mappers);
    }

    return finalValue;
  }

  _resolveArray(
    templateArr: unknown[],
    data: unknown,
    options?: ResolveFunctionOptions
  ): unknown[] {
    return templateArr.map((value) =>
      this._resolveTemplate(value, data, '', options)
    );
  }

  _resolveObject(
    template: Record<string, unknown>,
    data: unknown,
    options?: ResolveFunctionOptions
  ): Record<string, unknown> {
    return mapValues(template, (value: unknown, propName) =>
      this._resolveTemplate(value, data, propName, options)
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
    data: unknown,
    options: ResolveFunctionOptions | TransformerFunction = {}
  ): unknown {
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
    return this._resolveTemplate(template, data, '', options);
  }

  _resolveTemplate(
    template: unknown,
    data: unknown,
    propName: string,
    options?: ResolveFunctionOptions
  ): unknown {
    if (Array.isArray(template)) {
      return this._resolveArray(template, data, options);
    }
    if (isString(template)) {
      return this._resolveString(template, data, propName, options);
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
        return this._resolveTemplate(mappingString, data, propName, {
          ...options,
          transformer: mappingTransformer,
        });
      }
      return this._resolveObject(temp, data, options);
    }
    return template;
  }
}
