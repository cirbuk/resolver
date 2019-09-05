# resolver

Resolver is capable of resolving any marked up JavaScript object/array/string against a data object.

## Installation

```JavaScript
npm install @kubric/resolver
```

or

```JavaScript
yarn add @kubric/resolver
```

## Usage

``` javascript
import Resolver from @kubric/resolver

//Data JSON
const data = {
  isFormData: false,
  appName: 'an_app',
  email: [{
    id: 'abc@gmail.com',
  }],
  mapValue: {
    data: {
      name: "tester",
      id: 1234
    }
  },
};

//Template JSON
const template = {
  method: 'post',
  isFormData: '{{isFormData}}',
  userId: 'userid_{{mapValue.data.id}}',
  data: {
    userid: '{{email.0.id}}',
    app_name: '{{appName}}',
  },
  extraData: '{{mapValue.data}}'
};

const resolver = new Resolver();
const resolvedData = resolver.resolve(template, data);

// resolvedData will be
// {
//   method: 'post',
//   isFormData: false,
//   data: {
//     userid: 'abc@gmail.com',
//     app_name: 'an_app',
//   },
//   extraData: {
//     name: "tester",
//     id: 1234
//   }
// }
```

## Mapping with transformers

Transformers can be defined in the template when extracted data need to be transformed before being applied.

``` javascript
import Resolver from @kubric/json-resolver

const data = {
  isFormData: false,
};

const template = {
  method: 'post',
  isFormData: {
    _mapping: "{{isFormData}}",
    _transformer(value) {
      return value === false ? "This is a false value" : "This is a true value";
    }
  }
};

const resolver = new Resolver();
const resolvedData = resolver.resolve(template, data);

// resolvedData will be
// {
//   isFormData: 'This is a false value',
// }
```

## API
### class Resolver
#### new Resolver(options)

Creates a new Resolver instance

##### options
`options` should be an object with the following 

**replaceUndefinedWith**: `optional` If a mapping is not found, by default it is replaced by `undefined`. To replace missing mappings 
with a custom character instead of `undefined`, set it here.

**transformer(mapping, value)**: `optional` Accepts a function which will be invoked for every mapping found, with the mapping 
string and the value resolved for that mapping. Whatever is returned by this method then becomes the value that will be replaced
in the template. <aside class="notice">Note: If a transformer is given, it will be called for every mapping found and 
it becomes the responsibility of the transformer to return the correct value with which the mapping is to be replaced with</aside>

**fields**: `optional` Accepts the field names as an object with properties `mapping` and `transformer` for advanced mappings. Defaults to `_mapping` for the mapping field and `_transformer` for the transformer field. See section **Advanced Mapping** for more details. 

#### resolver.resolve(template, data, [transformer])
* **template**: `required` template JSON object containing the markup mappings that need to be resolved
* **data**: `required` template JSON object containing the markup mappings that need to be resolved
* **transformer**: `optional` This transformer overrides the transformer set(if any) while creating the object. Transformer function 
passed to the resolve function will be valid only for that call to the function.



  