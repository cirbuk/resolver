export type TransformerType = (match: string, ...parts: any[]) => string;
export type MappersEntryType = Array<RegExp | TransformerType | string>;
export type MappersType = Array<MappersEntryType>;

export interface FieldsOption {
  mapping?: string,
  transformer?: string
}

export interface ResolverOptions {
  replaceUndefinedWith?: any,
  ignoreUndefined?: boolean,
  transformer?: Function,
  fields?: FieldsOption,
  mappers?: MappersType,
  delimiter?: string,
  overrideDefault?: boolean,
  ignoreEmptyMapping?: boolean
}

export interface ResolveFunctionOptions {
  transformer?: Function,
  mappers?: MappersType,
  overrideDefault?: boolean
}
