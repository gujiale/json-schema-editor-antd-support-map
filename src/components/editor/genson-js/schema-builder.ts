/* eslint-disable @typescript-eslint/no-unused-vars */
// copy from https://github.com/aspecto-io/genson-js
import { Schema, SchemaGenOptions, ValueType } from './types';

// eslint-disable-next-line
function createSchemaFor(value: any, options?: SchemaGenOptions): Schema {
  switch (typeof value) {
    case 'number':
      if (Number.isInteger(value)) {
        return { type: ValueType.Integer };
      }
      return { type: ValueType.Number };
    case 'boolean':
      return { type: ValueType.Boolean };
    case 'string':
      return { type: ValueType.String };
    case 'object':
      if (value === null) {
        return { type: ValueType.Null };
      }
      if (Array.isArray(value)) {
        return createSchemaForArray(value, options);
      }
      return createSchemaForObject(value, options);
    default:
      throw new Error('unknown type');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSchemaForArray(arr: Array<any>, options?: SchemaGenOptions): Schema {
  if (arr.length === 0) {
    return { type: ValueType.Array };
  }
  const elementSchemas = arr.map((value) => createSchemaFor(value, options));
  const items = combineSchemas(elementSchemas);
  return { type: ValueType.Array, items };
}

function createSchemaForObject(obj: unknown, options?: SchemaGenOptions): Schema {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return {
      type: ValueType.Object,
    };
  }
  const properties = Object.entries(obj).reduce((props, [key, val]) => {
    props[key] = createSchemaFor(val, options);
    return props;
  }, {});

  const schema: Schema = { type: ValueType.Object, properties };
  if (!options?.noRequired) {
    schema.required = keys;
  }
  return schema;
}

function combineSchemas(schemas: Schema[], options?: SchemaGenOptions): Schema {
  const schemasByType: Record<ValueType, Schema[]> = {
    [ValueType.Null]: [],
    [ValueType.Boolean]: [],
    [ValueType.Integer]: [],
    [ValueType.Number]: [],
    [ValueType.String]: [],
    [ValueType.Array]: [],
    [ValueType.Object]: [],
    [ValueType.Map]: [],
    [ValueType.Int64]: [],
    [ValueType.String32]: [],
    [ValueType.Double]: [],
    [ValueType.Int32]: [],
    [ValueType.Int16]: [],
    [ValueType.UInt32]: [],
    [ValueType.UInt64]: [],
    [ValueType.List]: [],
    [ValueType.String16]: [],
    [ValueType.Bool]: [],
  };

  const unwrappedSchemas = unwrapSchemas(schemas);
  for (const unwrappedSchema of unwrappedSchemas) {
    const type = unwrappedSchema.type as ValueType;
    if (schemasByType[type].length === 0 || isContainerSchema(unwrappedSchema)) {
      schemasByType[type].push(unwrappedSchema);
    } else {
    }
  }

  const resultSchemasByType: Record<ValueType, Schema> = {
    [ValueType.Null]: schemasByType[ValueType.Null][0],
    [ValueType.Boolean]: schemasByType[ValueType.Boolean][0],
    [ValueType.Number]: schemasByType[ValueType.Number][0],
    [ValueType.Integer]: schemasByType[ValueType.Integer][0],
    [ValueType.String]: schemasByType[ValueType.String][0],
    [ValueType.Array]: combineArraySchemas(schemasByType[ValueType.Array]),
    [ValueType.Object]: combineObjectSchemas(schemasByType[ValueType.Object], options),
    [ValueType.Map]: combineMapSchemas(schemasByType[ValueType.Map]),
    [ValueType.Int64]: schemasByType[ValueType.Int64][0],
    [ValueType.String32]: schemasByType[ValueType.String32][0],
    [ValueType.Double]: schemasByType[ValueType.Double][0],
    [ValueType.Int32]: schemasByType[ValueType.Int32][0],
    [ValueType.Int16]: schemasByType[ValueType.Int16][0],
    [ValueType.UInt32]: schemasByType[ValueType.UInt32][0],
    [ValueType.UInt64]: schemasByType[ValueType.UInt64][0],
    [ValueType.List]: schemasByType[ValueType.List][0],
    [ValueType.String16]: schemasByType[ValueType.String16][0],
    [ValueType.Bool]: schemasByType[ValueType.Bool][0],
  };

  if (resultSchemasByType[ValueType.Number]) {
    // if at least one value is float, others can be floats too
    delete resultSchemasByType[ValueType.Integer];
  }

  const schemasFound = Object.values(resultSchemasByType).filter(Boolean);
  const multiType = schemasFound.length > 1;
  if (multiType) {
    return wrapAnyOfSchema({ anyOf: schemasFound });
  }
  return schemasFound[0] as Schema;
}

function combineArraySchemas(schemas: Schema[]): Schema {
  if (!schemas || schemas.length === 0) {
    return undefined;
  }
  const itemSchemas: Schema[] = [];
  for (const schema of schemas) {
    if (!schema.items) continue;
    const unwrappedSchemas = unwrapSchema(schema.items);
    itemSchemas.push(...unwrappedSchemas);
  }

  if (itemSchemas.length === 0) {
    return {
      type: ValueType.Array,
    };
  }
  const items = combineSchemas(itemSchemas);
  return {
    type: ValueType.Array,
    items,
  };
}

function combineMapSchemas(schemas: Schema[]): Schema {
  if (!schemas || schemas.length === 0) {
    return undefined;
  }
  const itemSchemas: Schema[] = [];
  for (const schema of schemas) {
    if (!schema.items) continue;
    const unwrappedSchemas = unwrapSchema(schema.items);
    itemSchemas.push(...unwrappedSchemas);
  }
  if (itemSchemas.length === 0) {
    return {
      type: ValueType.Map,
    };
  }
  const items = combineSchemas(itemSchemas);
  return {
    type: ValueType.Map,
    items,
  };
}

function combineObjectSchemas(schemas: Schema[], options?: SchemaGenOptions): Schema {
  if (!schemas || schemas.length === 0) {
    return undefined;
  }
  const allPropSchemas = schemas.map((s) => s.properties).filter(Boolean);
  const schemasByProp: Record<string, Schema[]> = Object.create(null);
  // const schemasByProp: Record<string, Schema[]> = {};
  for (const propSchemas of allPropSchemas) {
    for (const [prop, schema] of Object.entries(propSchemas)) {
      if (!schemasByProp[prop]) {
        schemasByProp[prop] = [];
      }
      const unwrappedSchemas = unwrapSchema(schema);
      schemasByProp[prop].push(...unwrappedSchemas);
    }
  }

  const properties: Record<string, Schema> = Object.entries(schemasByProp).reduce(
    (props, [prop, schemas]) => {
      if (schemas.length === 1) {
        props[prop] = schemas[0];
      } else {
        props[prop] = combineSchemas(schemas);
      }
      return props;
    },
    {}
  );

  const combinedSchema: Schema = { type: ValueType.Object };

  if (Object.keys(properties).length > 0) {
    combinedSchema.properties = properties;
  }
  if (!options?.noRequired) {
    const required = intersection(schemas.map((s) => s.required || []));
    if (required.length > 0) {
      combinedSchema.required = required;
    }
  }

  return combinedSchema;
}

export function unwrapSchema(schema: Schema): Schema[] {
  if (!schema) return [];
  if (schema.anyOf) {
    return unwrapSchemas(schema.anyOf);
  }
  if (Array.isArray(schema.type)) {
    return schema.type.map((x) => ({ type: x }));
  }
  return [schema];
}

export function unwrapSchemas(schemas: Schema[]): Schema[] {
  if (!schemas || schemas.length === 0) return [];
  return schemas.flatMap((schema) => unwrapSchema(schema));
}

export function wrapAnyOfSchema(schema: Schema): Schema {
  const simpleSchemas = [];
  const complexSchemas = [];
  for (const subSchema of schema.anyOf) {
    if (Array.isArray(subSchema.type)) {
      simpleSchemas.push(...subSchema.type);
    } else if (isSimpleSchema(subSchema)) {
      simpleSchemas.push((subSchema as Schema).type);
    } else {
      complexSchemas.push(subSchema);
    }
  }
  if (complexSchemas.length === 0) {
    return { type: simpleSchemas };
  }
  const anyOf = [];
  if (simpleSchemas.length > 0) {
    anyOf.push({ type: simpleSchemas.length > 1 ? simpleSchemas : simpleSchemas[0] });
  }
  anyOf.push(...complexSchemas);
  return { anyOf };
}

function intersection(valuesArr: string[][]) {
  if (valuesArr.length === 0) return [];
  const arrays = valuesArr.filter(Array.isArray);
  const counter: Record<string, number> = {};
  for (const arr of arrays) {
    for (const val of arr) {
      if (!counter[val]) {
        counter[val] = 1;
      } else {
        counter[val]++;
      }
    }
  }
  return Object.entries(counter)
    .filter(([_, value]) => value === arrays.length)
    .map(([key]) => key);
}

function isSimpleSchema(schema: Schema): boolean {
  const keys = Object.keys(schema);
  return keys.length === 1 && keys[0] === 'type';
}

function isContainerSchema(schema: Schema): boolean {
  const type = (schema as Schema).type;
  return type === ValueType.Array || type === ValueType.Object;
}

// FACADE

export function createSchema(value: unknown, options?: SchemaGenOptions): Schema {
  if (typeof value === 'undefined') value = null;
  const clone = JSON.parse(JSON.stringify(value));
  return createSchemaFor(clone, options);
}

export function mergeSchemas(schemas: Schema[], options?: SchemaGenOptions): Schema {
  return combineSchemas(schemas, options);
}

export function extendSchema(schema: Schema, value: unknown, options?: SchemaGenOptions): Schema {
  const valueSchema = createSchema(value, options);
  return combineSchemas([schema, valueSchema], options);
}

export function createCompoundSchema(values: unknown[], options?: SchemaGenOptions): Schema {
  const schemas = values.map((value) => createSchema(value, options));
  return mergeSchemas(schemas, options);
}
