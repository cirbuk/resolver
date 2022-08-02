export type TransformerType = (match: string, ...parts: any[]) => string;
export type MapperTransformerType = (...args: string[]) => string;
export type MappersEntryType = [RegExp | string, MapperTransformerType];
export type MappersType = MappersEntryType[];

export interface FieldsOption {
  mapping?: string;
  transformer?: string;
}

export type TransformerFunction = (
  value: unknown,
  dataPath: string,
  propName: string
) => unknown;

export interface ResolverOptions {
  replaceUndefinedWith?: any;
  ignoreUndefined?: boolean;
  transformer?: TransformerFunction;
  fields?: FieldsOption;
  mappers?: MappersType;
  delimiter?: string;
  overrideDefault?: boolean;
  ignoreEmptyMapping?: boolean;
}

export interface ResolveFunctionOptions {
  transformer?: TransformerFunction;
  mappers?: MappersType;
  overrideDefault?: boolean;
}
