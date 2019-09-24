export type TransformerType = (match: string, ...parts: any[]) => string;
export type TransformMapEntryType = Array<RegExp | TransformerType | string>;
export type TransformMapType = Array<TransformMapEntryType>;

export interface FieldsOption {
  mapping?: string,
  transformer?: string
}

export interface ResolverOptions {
  replaceUndefinedWith?: any,
  ignoreUndefined?: boolean,
  transformer?: Function,
  fields?: FieldsOption,
  transformMap?: TransformMapType,
  delimiter?: string
}

export interface ResolveFunctionOptions {
  transformer?: Function,
  transformMap?: TransformMapType
}
