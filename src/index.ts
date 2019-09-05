import { get, isFunction, isObject, isNull, isString, isUndefined, mapValues, isValidString } from "@kubric/litedash";
import { ResolveFunctionOptions, ResolverOptions, TransformerType, TransformMapType } from "./interfaces";

export default class Resolver {
  mappingField: string;
  replaceUndefinedWith?: any;
  transformerField: string;
  transformer?: Function;
  transformMap?: TransformMapType;
  ignoreUndefined?: boolean;

  constructor({
                replaceUndefinedWith,
                ignoreUndefined = false,
                transformer,
                transformMap,
                fields = {
                  mapping: "_mapping",
                  transformer: "_transformer"
                }
              }: ResolverOptions = {}) {
    this.replaceUndefinedWith = replaceUndefinedWith;
    if(isUndefined(this.replaceUndefinedWith)) {
      this.ignoreUndefined = ignoreUndefined;
    }
    this.transformer = transformer;
    this.transformMap = transformMap;
    const { mapping: mappingField, transformer: transformerField } = fields;
    this.mappingField = isValidString(mappingField) ? mappingField as string : "_mapping";
    this.transformerField = isValidString(transformerField) ? transformerField as string : "_transformer";
  }

  getTransformedResult(dataKey: string, value: any, transformer: Function | undefined, match: string) {
    value = !isUndefined(value) ? value : (this.ignoreUndefined ? match : this.replaceUndefinedWith);
    transformer = transformer || this.transformer;
    return isFunction(transformer) ? (transformer as Function)(dataKey, value) : value;
  }

  static resolveTransformMap(srcStr: string, transformMap: TransformMapType = []) {
    return transformMap.reduce((accStr, [regex, transformer]) => {
      if(!isString(accStr)) {
        return accStr;
      } else if((regex as RegExp).global) {
        return accStr.replace(regex as RegExp, transformer as TransformerType);
      } else {
        const results = (regex as RegExp).exec(accStr);
        //@ts-ignore
        return isNull(results) ? accStr : (transformer as TransformerType)(...results);
      }
    }, srcStr);
  }

  resolveString(templateStr: string, data: any, { transformer, transformMap = [] }: ResolveFunctionOptions = {}) {
    transformer = transformer || this.transformer;
    transformMap = transformMap || this.transformMap;
    if(!isUndefined(data) || isFunction(transformer) || transformMap.length > 0) {
      let resultString = templateStr;
      const matches = templateStr.match(/^{{([^{}]+?)}}$/);
      if(matches !== null) {
        const [match, dataKey] = matches;
        resultString = this.getTransformedResult(dataKey, get(data, dataKey), transformer, match);
      } else {
        resultString = templateStr.replace(/{{(.+?)}}/g, (match, datakey) => this.getTransformedResult(datakey, get(data, datakey), transformer, match));
      }
      resultString = Resolver.resolveTransformMap(resultString, transformMap);
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

  static processTransformMap(transformMap: TransformMapType = []) {
    return transformMap.reduce((acc, [regex, transformer] = []) => {
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
    }, [] as TransformMapType);
  }

  resolve(template: any, data: any, options: ResolveFunctionOptions | Function = {}) {
    if(isFunction(options)) {
      options = {
        transformer: options
      } as ResolveFunctionOptions;
    } else {
      const { transformMap, ...rest } = options as ResolveFunctionOptions;
      options = {
        ...rest,
        transformMap: Resolver.processTransformMap(transformMap)
      };
    }
    return this.resolveTemplate(template, data, options);
  };

  resolveTemplate(template: any, data: any, options?: ResolveFunctionOptions) {
    if(Array.isArray(template)) {
      return this.resolveArray(template, data, options);
    } else if(isString(template)) {
      return this.resolveString(template, data, options);
    } else if(isObject(template)) {
      const _mapping = template[this.mappingField];
      const _transformer = template[this.transformerField];
      if(_mapping && _transformer && isFunction(_transformer)) {
        const resolvedData: any = this.resolveTemplate(_mapping, data, options);
        return _transformer(resolvedData);
      } else {
        return this.resolveObject(template, data, options);
      }
    } else {
      return template;
    }
  }
}