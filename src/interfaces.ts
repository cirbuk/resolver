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
  delimiter?: string
}

export interface ResolveFunctionOptions {
  transformer?: Function,
  mappers?: MappersType
}
