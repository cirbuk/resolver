export type TransformerType = (match: string, ...parts: any[]) => string;
export type CustomMappersEntryType = Array<RegExp | TransformerType | string>;
export type CustomMappersType = Array<CustomMappersEntryType>;

export interface FieldsOption {
  mapping?: string,
  transformer?: string
}

export interface ResolverOptions {
  replaceUndefinedWith?: any,
  ignoreUndefined?: boolean,
  transformer?: Function,
  fields?: FieldsOption,
  customMappers?: CustomMappersType,
  delimiter?: string
}

export interface ResolveFunctionOptions {
  transformer?: Function,
  customMappers?: CustomMappersType
}
