// copy from https://github.com/aspecto-io/genson-js
export enum ValueType {
  Null = 'null',
  Int16 = 'int16',
  Int32 = 'int32',
  Int64 = 'int64',
  Double = 'double',
  UInt32 = 'uint32',
  UInt64 = 'uint64',
  Object = 'object',
  List = 'list',
  String16 = 'string16',
  String32 = 'string32',
  Bool = 'bool',
  Map = 'map',
  Array = 'array',
  Boolean = 'boolean',
  String = 'string',
  Integer = 'integer',
  Number = 'number',
}

export type Schema = {
  type?: ValueType | ValueType[];
  items?: Schema;
  properties?: Record<string, Schema>;
  required?: string[];
  anyOf?: Array<Schema>;
};

export type SchemaGenOptions = {
  noRequired: boolean;
};

export type SchemaComparisonOptions = {
  ignoreRequired: boolean;
};
