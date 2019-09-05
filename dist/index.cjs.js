'use strict';

var litedash = require('@kubric/litedash');

class Resolver {
    constructor({ replaceUndefinedWith, ignoreUndefined = false, transformer, fields = {
        mapping: "_mapping",
        transformer: "_transformer"
    } } = {}) {
        this.replaceUndefinedWith = replaceUndefinedWith;
        if (litedash.isUndefined(this.replaceUndefinedWith)) {
            this.ignoreUndefined = ignoreUndefined;
        }
        this.transformer = transformer;
        const { mapping: mappingField, transformer: transformerField } = fields;
        this.mappingField = litedash.isValidString(mappingField) ? mappingField : "_mapping";
        this.transformerField = litedash.isValidString(transformerField) ? transformerField : "_transformer";
    }
    getTransformedResult(dataKey, value, transformer, match) {
        value = !litedash.isUndefined(value) ? value : (this.ignoreUndefined ? match : this.replaceUndefinedWith);
        transformer = transformer || this.transformer;
        return litedash.isFunction(transformer) ? transformer(dataKey, value) : value;
    }
    static resolveTransformMap(srcStr, transformMap = []) {
        return transformMap.reduce((accStr, [regex, transformer]) => {
            if (!litedash.isString(accStr)) {
                return accStr;
            }
            else if (regex.global) {
                return accStr.replace(regex, transformer);
            }
            else {
                const results = regex.exec(accStr);
                //@ts-ignore
                return litedash.isNull(results) ? accStr : transformer(...results);
            }
        }, srcStr);
    }
    resolveString(templateStr, data, { transformer, transformMap = [] } = {}) {
        transformer = transformer || this.transformer;
        if (!litedash.isUndefined(data) || litedash.isFunction(transformer) || transformMap.length > 0) {
            let resultString = templateStr;
            const matches = templateStr.match(/^{{([^{}]+?)}}$/);
            if (matches !== null) {
                const [match, dataKey] = matches;
                resultString = this.getTransformedResult(dataKey, litedash.get(data, dataKey), transformer, match);
            }
            else {
                resultString = templateStr.replace(/{{(.+?)}}/g, (match, datakey) => this.getTransformedResult(datakey, litedash.get(data, datakey), transformer, match));
            }
            resultString = Resolver.resolveTransformMap(resultString, transformMap);
            return resultString;
        }
        else {
            return templateStr;
        }
    }
    ;
    resolveArray(templateArr, data, options) {
        return templateArr.map(value => this.resolveTemplate(value, data, options));
    }
    resolveObject(template, data, options) {
        return litedash.mapValues(template, (value) => this.resolveTemplate(value, data, options));
    }
    static processTransformMap(transformMap = []) {
        return transformMap.reduce((acc, [regex, transformer] = []) => {
            if (!litedash.isFunction(transformer)) {
                return acc;
            }
            if (litedash.isString(regex)) {
                return [...acc, [new RegExp(regex, "g"), transformer]];
            }
            else if (regex.constructor === RegExp) {
                return [...acc, [regex, transformer]];
            }
            else {
                return acc;
            }
        }, []);
    }
    resolve(template, data, options = {}) {
        if (litedash.isFunction(options)) {
            options = {
                transformer: options
            };
        }
        else {
            const { transformMap, ...rest } = options;
            options = {
                ...rest,
                transformMap: Resolver.processTransformMap(transformMap)
            };
        }
        return this.resolveTemplate(template, data, options);
    }
    ;
    resolveTemplate(template, data, options) {
        if (Array.isArray(template)) {
            return this.resolveArray(template, data, options);
        }
        else if (litedash.isString(template)) {
            return this.resolveString(template, data, options);
        }
        else if (litedash.isObject(template)) {
            const _mapping = template[this.mappingField];
            const _transformer = template[this.transformerField];
            if (_mapping && _transformer && litedash.isFunction(_transformer)) {
                const resolvedData = this.resolveTemplate(_mapping, data, options);
                return _transformer(resolvedData);
            }
            else {
                return this.resolveObject(template, data, options);
            }
        }
        else {
            return template;
        }
    }
}

module.exports = Resolver;
