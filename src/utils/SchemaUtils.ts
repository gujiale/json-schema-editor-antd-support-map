import _ from 'lodash';
import Schema from '../types/Schema';

export function getDefaultSchema(type: string): Schema {
  switch (type) {
    case 'uint32':
      return {
        type: 'uint32',
      };
    case 'uint64':
      return {
        type: 'uint64',
      };
    case 'int16':
      return {
        type: 'int16',
      };
    case 'int32':
      return {
        type: 'int32',
      };
    case 'int64':
      return {
        type: 'int64',
      };
    case 'string16':
      return {
        type: 'string16',
      };
    case 'string32':
      return {
        type: 'string32',
      };
    case 'double':
      return {
        type: 'double',
      };
    case 'list':
      return {
        type: 'list',
        items: {
          type: 'string16',
        },
      };
    case 'object':
      return {
        type: 'object',
        properties: {},
      };
    case 'bool':
      return {
        type: 'bool',
      };
    case 'map':
      return {
        type: 'map',
        mapItems: [{ type: 'string16' }, { type: 'string16' }],
      };
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

export const handleSchema = (schema: Schema): Schema => {
  const clonedSchema = _.cloneDeep(schema);
  if (clonedSchema && !clonedSchema.type && !clonedSchema.properties) {
    clonedSchema.type = 'string';
  }
  if (
    !clonedSchema.type &&
    clonedSchema.properties &&
    typeof clonedSchema.properties === 'object'
  ) {
    clonedSchema.type = 'object';
  }
  if (clonedSchema.type === 'object') {
    if (!clonedSchema.properties) {
      clonedSchema.properties = {};
    }
    Object.keys(clonedSchema.properties).forEach((key) => {
      if (
        !clonedSchema.properties[key].type &&
        clonedSchema.properties[key].properties &&
        typeof clonedSchema.properties[key].properties === 'object'
      ) {
        clonedSchema.properties[key].type = 'object';
      }
      if (
        clonedSchema.properties[key].type === 'list' ||
        clonedSchema.properties[key].type === 'object'
      ) {
        clonedSchema.properties[key] = handleSchema(clonedSchema.properties[key]);
      }
    });
  } else if (clonedSchema.type === 'list') {
    if (!clonedSchema.items) {
      clonedSchema.items = { type: 'string16' };
    }
    clonedSchema.items = handleSchema(clonedSchema.items);
  }
  return clonedSchema;
};

export const getParentKey = (keys: string[]): string[] => {
  //console.log('getParentKey:', keys);
  if (!keys) {
    return [];
  }
  return keys.length === 1 ? [] : _.dropRight(keys, 1);
};

export const addRequiredFields = (schema: Schema, keys: string[], fieldName: string): Schema => {
  const parentKeys: string[] = getParentKey(keys); // parent
  const parentData = parentKeys.length ? _.get(schema, parentKeys) : schema;
  const requiredData: string[] = [].concat(parentData.required || []);
  requiredData.push(fieldName);
  parentKeys.push('required');
  return _.set(schema, parentKeys, _.uniq(requiredData));
};

export const removeRequireField = (schema: Schema, keys: string[], fieldName: string): Schema => {
  const parentKeys: string[] = getParentKey(keys); // parent
  const parentData = parentKeys.length ? _.get(schema, parentKeys) : schema;
  const requiredData = [].concat(parentData.required || []);
  const filteredRequire = requiredData.filter((i) => i !== fieldName);
  parentKeys.push('required');
  return _.set(schema, parentKeys, _.uniq(filteredRequire));
};

export const handleSchemaRequired = (schema: Schema, checked: boolean): Schema => {
  const newSchema = _.cloneDeep(schema);
  if (newSchema.type === 'object') {
    const requiredTitle = getFieldsTitle(newSchema.properties);
    if (checked) {
      newSchema.required = requiredTitle;
    } else {
      delete newSchema.required;
    }
    if (newSchema.properties) {
      newSchema.properties = handleObject(newSchema.properties, checked);
    }
  } else if (newSchema.type === 'list') {
    if (newSchema.items) {
      newSchema.items = handleSchemaRequired(newSchema.items, checked);
    }
  }
  return newSchema;
};

function handleObject(properties: Record<string, Schema>, checked: boolean) {
  const clonedProperties = _.cloneDeep(properties);
  for (const key in clonedProperties) {
    if (clonedProperties[key].type === 'list' || clonedProperties[key].type === 'object')
      clonedProperties[key] = handleSchemaRequired(clonedProperties[key], checked);
  }
  return clonedProperties;
}

function getFieldsTitle(data: Record<string, Schema>): string[] {
  const requiredTitle: string[] = [];
  Object.keys(data).forEach((title) => {
    requiredTitle.push(title);
  });
  return requiredTitle;
}
