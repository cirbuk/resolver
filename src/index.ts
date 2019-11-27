import {
  get,
  isFunction,
  isNull,
  isString,
  isUndefined,
  mapValues,
  isValidString,
  isPlainObject
} from "@kubric/litedash";
import { ResolveFunctionOptions, ResolverOptions, TransformerType, MappersType } from "./interfaces";

export default class Resolver {
  mappingField: string;
  replaceUndefinedWith?: any;
  transformerField: string;
  transformer?: Function;
  mappers?: MappersType;
  ignoreUndefined?: boolean;
  delimiter: string;

  constructor({
                replaceUndefinedWith,
                ignoreUndefined = false,
                transformer,
                mappers,
                fields = {
                  mapping: "_mapping",
                  transformer: "_transformer"
                },
                delimiter = '|'
              }: ResolverOptions = {}) {
    this.replaceUndefinedWith = replaceUndefinedWith;
    if(isUndefined(this.replaceUndefinedWith)) {
      this.ignoreUndefined = ignoreUndefined;
    }
    this.transformer = transformer;
    this.mappers = Resolver._processMappers(mappers);
    const { mapping: mappingField, transformer: transformerField } = fields;
    this.mappingField = isValidString(mappingField) ? mappingField as string : "_mapping";
    this.transformerField = isValidString(transformerField) ? transformerField as string : "_transformer";
    this.delimiter = delimiter;
  }

  _getTransformedResult(dataKey: string, value: any, transformer: Function | undefined, match: string) {
    value = !isUndefined(value) ? value : (this.ignoreUndefined ? match : this.replaceUndefinedWith);
    transformer = transformer || this.transformer;
    return isFunction(transformer) ? (transformer as Function)(value, dataKey) : value;
  }

  static _resolveMappers(srcStr: string, mappers: MappersType = []) {
    return mappers.reduce((accStr, [regex, transformer]) => {
      if(!isString(accStr)) {
        return accStr;
      } else {
        const results = (regex as RegExp).exec(accStr);
        if(isNull(results)) {
          return accStr;
        } else {
          //@ts-ignore
          if(results[0] !== accStr) {
            return accStr.replace(regex as RegExp, transformer as TransformerType);
          } else {
            //@ts-ignore
            return (transformer as TransformerType)(...results);
          }
        }
      }
    }, srcStr);
  }

  _getValue(data: any, dataKey: string = '') {
    let [key, defaultValue, type = ''] = dataKey.split(this.delimiter);
    let finalDefaultValue: any = defaultValue;
    if(type === 'null') {
      finalDefaultValue = null;
    }
    let value = get(data, key, finalDefaultValue);
    if(type.length > 0) {
      if(type === "number") {
        value = +value;
      } else if(type === "string") {
        value = `${value}`;
      } else if(type === "boolean") {
        value = typeof value === "boolean" ? value : value === "true";
      } else if(type === "array") {
        value = Array.isArray(value) ? value : JSON.parse(value);
      } else if(type === "object") {
        value = isPlainObject(value) ? value : JSON.parse(value);
      }
    }
    return {
      key,
      value
    };
  }

  _resolveString(str: string, data: any, { transformer, mappers = [] }: ResolveFunctionOptions = {}) {
    transformer = transformer || this.transformer;
    mappers = mappers || this.mappers;
    const resolve = (str: string, data: any, isFirst = true) => {
      const regex = /{{|}}/g;
      let statusFlag = 0, start = 0;
      let result = regex.exec(str);
      while(result !== null) {
        const [match] = result;
        if(statusFlag === 0) {
          start = result.index;
        }
        match === "{{" ? statusFlag++ : ((match === "}}" && statusFlag > 0) ? statusFlag-- : statusFlag);
        if(statusFlag === 0) {
          const chunkToReplace = str.substring(start + 2, regex.lastIndex - 2);
          const replaced = resolve(chunkToReplace, data, false);
          if(start === 0 && regex.lastIndex === str.length) {
            str = replaced;
          } else {
            let newStr = `${str.substring(0, start)}${replaced}`;
            const nextSearchIndex = newStr.length;
            newStr = `${newStr}${str.substring(regex.lastIndex)}`;
            regex.lastIndex = nextSearchIndex;
            str = newStr;
          }
        }
        result = regex.exec(str);
      }
      if(!isFirst) {
        const { value: untransformedValue, key } = this._getValue(data, str);
        return this._getTransformedResult(key, untransformedValue, transformer, `{{${str}}}`);
      } else {
        return str;
      }
    };
    let finalValue = resolve(str, data);
    if(mappers.length > 0) {
      finalValue = Resolver._resolveMappers(finalValue, mappers)
    }

    return finalValue;
  }

  _resolveArray(templateArr: Array<any>, data: any, options?: ResolveFunctionOptions): Array<any> {
    return templateArr.map(value => this._resolveTemplate(value, data, options));
  }

  _resolveObject(template: Object, data: any, options?: ResolveFunctionOptions) {
    return mapValues(template, (value: string) => this._resolveTemplate(value, data, options));
  }

  static _processMappers(mappers: MappersType = []) {
    return mappers.reduce((acc, [regex, transformer] = []) => {
      if(!isFunction(transformer)) {
        return acc;
      }
      if(isString(regex)) {
        return [...acc, [new RegExp(regex as string, "g"), transformer]];
      } else if(regex.constructor === RegExp) {
        return [...acc, [regex, transformer]];
      } else {
        return acc;
      }
    }, [] as MappersType);
  }

  resolve(template: any, data: any, options: ResolveFunctionOptions | Function = {}) {
    if(isFunction(options)) {
      options = {
        transformer: options
      } as ResolveFunctionOptions;
    } else {
      const { mappers, ...rest } = options as ResolveFunctionOptions;
      options = {
        ...rest,
        mappers: mappers ? Resolver._processMappers(mappers) : this.mappers
      };
    }
    return this._resolveTemplate(template, data, options);
  };

  _resolveTemplate(template: any, data: any, options?: ResolveFunctionOptions): any {
    if(Array.isArray(template)) {
      return this._resolveArray(template, data, options);
    } else if(isString(template)) {
      return this._resolveString(template, data, options);
    } else if(isPlainObject(template)) {
      const _mapping = template[this.mappingField];
      const _transformer = template[this.transformerField];
      if(Object.keys(template).length === 2 && _mapping && _transformer && isFunction(_transformer)) {
        return this._resolveTemplate(_mapping, data, {
          ...options,
          transformer: _transformer
        });
      } else {
        return this._resolveObject(template, data, options);
      }
    } else {
      return template;
    }
  }
}