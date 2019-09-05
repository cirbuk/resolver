!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r(require("@kubric/litedash")):"function"==typeof define&&define.amd?define(["@kubric/litedash"],r):(e=e||self).library=r(e.litedash)}(this,function(e){"use strict";function r(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function t(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,n)}return t}function n(e,r){if(null==e)return{};var t,n,i=function(e,r){if(null==e)return{};var t,n,i={},s=Object.keys(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||(i[t]=e[t]);return i}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}class i{constructor({replaceUndefinedWith:r,ignoreUndefined:t=!1,transformer:n,fields:i={mapping:"_mapping",transformer:"_transformer"}}={}){this.replaceUndefinedWith=r,e.isUndefined(this.replaceUndefinedWith)&&(this.ignoreUndefined=t),this.transformer=n;const{mapping:s,transformer:o}=i;this.mappingField=e.isValidString(s)?s:"_mapping",this.transformerField=e.isValidString(o)?o:"_transformer"}getTransformedResult(r,t,n,i){return t=e.isUndefined(t)?this.ignoreUndefined?i:this.replaceUndefinedWith:t,n=n||this.transformer,e.isFunction(n)?n(r,t):t}static resolveTransformMap(r,t=[]){return t.reduce((r,[t,n])=>{if(e.isString(r)){if(t.global)return r.replace(t,n);{const i=t.exec(r);return e.isNull(i)?r:n(...i)}}return r},r)}resolveString(r,t,{transformer:n,transformMap:s=[]}={}){if(n=n||this.transformer,!e.isUndefined(t)||e.isFunction(n)||s.length>0){let o=r;const a=r.match(/^{{([^{}]+?)}}$/);if(null!==a){const[r,i]=a;o=this.getTransformedResult(i,e.get(t,i),n,r)}else o=r.replace(/{{(.+?)}}/g,(r,i)=>this.getTransformedResult(i,e.get(t,i),n,r));return o=i.resolveTransformMap(o,s)}return r}resolveArray(e,r,t){return e.map(e=>this.resolveTemplate(e,r,t))}resolveObject(r,t,n){return e.mapValues(r,e=>this.resolveTemplate(e,t,n))}static processTransformMap(r=[]){return r.reduce((r,[t,n]=[])=>e.isFunction(n)?e.isString(t)?[...r,[new RegExp(t,"g"),n]]:t.constructor===RegExp?[...r,[t,n]]:r:r,[])}resolve(s,o,a={}){if(e.isFunction(a))a={transformer:a};else{const{transformMap:e}=a;a=function(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{};n%2?t(i,!0).forEach(function(t){r(e,t,i[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):t(i).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(i,r))})}return e}({},n(a,["transformMap"]),{transformMap:i.processTransformMap(e)})}return this.resolveTemplate(s,o,a)}resolveTemplate(r,t,n){if(Array.isArray(r))return this.resolveArray(r,t,n);if(e.isString(r))return this.resolveString(r,t,n);if(e.isObject(r)){const i=r[this.mappingField],s=r[this.transformerField];if(i&&s&&e.isFunction(s)){return s(this.resolveTemplate(i,t,n))}return this.resolveObject(r,t,n)}return r}}return i});
