import {
  get,
  isFunction,
  isObject,
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
    this.mappers = Resolver.processMappers(mappers);
    const { mapping: mappingField, transformer: transformerField } = fields;
    this.mappingField = isValidString(mappingField) ? mappingField as string : "_mapping";
    this.transformerField = isValidString(transformerField) ? transformerField as string : "_transformer";
    this.delimiter = delimiter;
  }

  getTransformedResult(dataKey: string, value: any, transformer: Function | undefined, match: string) {
    value = !isUndefined(value) ? value : (this.ignoreUndefined ? match : this.replaceUndefinedWith);
    transformer = transformer || this.transformer;
    return isFunction(transformer) ? (transformer as Function)(value, dataKey) : value;
  }

  static resolveMappers(srcStr: string, mappers: MappersType = []) {
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

  getValue(data: any, dataKey: string = '') {
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
    return value;
  }

  hasMultipleMatches(templateStr: string) {
    const matches = templateStr.match(new RegExp(`^{{([^{}]+?)}}$`));
    if(matches !== null) {
      return matches;
    } else if(!/^{{.*}}$/.test(templateStr)) {
      return null;
    } else {
      const proposedDatakey = templateStr.replace(/^{{|}}$/g, "");
      const [key, defaultValue, type] = proposedDatakey.split(this.delimiter);
      return type === 'object' ? [templateStr, proposedDatakey] : null;
    }
  }

  resolveString(templateStr: string, data: any, { transformer, mappers = [] }: ResolveFunctionOptions = {}) {
    transformer = transformer || this.transformer;
    mappers = mappers || this.mappers;
    if(!isUndefined(data) || isFunction(transformer) || mappers.length > 0) {
      let resultString = templateStr;
      const matches = this.hasMultipleMatches(templateStr);
      if(matches !== null) {
        const [match, dataKey] = matches;
        resultString = this.getTransformedResult(dataKey, this.getValue(data, dataKey), transformer, match);
      } else {
        resultString = templateStr.replace(/{{(.+?)}}/g, (match, datakey) => this.getTransformedResult(datakey, this.getValue(data, datakey), transformer, match));
      }
      resultString = mappers.length > 0 ? Resolver.resolveMappers(resultString, mappers) : resultString;
      return resultString;
    } else {
      return templateStr;
    }
  };

  resolveArray(templateArr: Array<any>, data: any, options?: ResolveFunctionOptions): Array<any> {
    return templateArr.map(value => this.resolveTemplate(value, data, options));
  }

  resolveObject(template: Object, data: any, options?: ResolveFunctionOptions) {
    return mapValues(template, (value: string) => this.resolveTemplate(value, data, options));
  }

  static processMappers(mappers: MappersType = []) {
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
        mappers: mappers ? Resolver.processMappers(mappers) : this.mappers
      };
    }
    return this.resolveTemplate(template, data, options);
  };

  resolveTemplate(template: any, data: any, options?: ResolveFunctionOptions): any {
    if(Array.isArray(template)) {
      return this.resolveArray(template, data, options);
    } else if(isString(template)) {
      return this.resolveString(template, data, options);
    } else if(isObject(template)) {
      const _mapping = template[this.mappingField];
      const _transformer = template[this.transformerField];
      if(Object.keys(template).length === 2 && _mapping && _transformer && isFunction(_transformer)) {
        return this.resolveTemplate(_mapping, data, {
          ...options,
          transformer: _transformer
        });
      } else {
        return this.resolveObject(template, data, options);
      }
    } else {
      return template;
    }
  }
}