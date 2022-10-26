import React, { ReactElement, useContext } from 'react';
import { observer } from 'mobx-react';
import SchemaArray from './schema-array';
import SchemaMap from './schema-map';
import SchemaObject from './schema-object';
import { SchemaMobxContext } from '../../index';
import Schema from '../../types/Schema';

export const mapping = (
  name: string[],
  data: Schema,
  showEdit: (
    prefix: string[],
    editorName: string,
    propertyElement: string | { mock: string },
    type?: string
  ) => void,
  showAdv: (prefix: string[], property: Schema) => void
): ReactElement => {
  // console.log("schema:", JSON.stringify(data));
  // 这里十分蛋疼，因为map是个数组，得每个都给它加上数组下标。不然map和list、obj这些各种子节点嵌套的时候会报错
  const lastKey = name.slice(-1);
  switch (data.type) {
    case 'list':
      if (lastKey[0] === 'mapItems') {
        // 这里写死1是因为map的key固定为string，但是value可以随意组合。不然没法路由到相应的schema
        const nameMap = [].concat(name, '1');
        return <SchemaArray prefix={nameMap} data={data} showEdit={showEdit} showAdv={showAdv} />;
      }
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} />;
    case 'map':
      if (lastKey[0] === 'mapItems') {
        const nameMap = [].concat(name, '1');
        return <SchemaMap prefix={nameMap} data={data} showEdit={showEdit} showAdv={showAdv} />;
      }
      return <SchemaMap prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} />;
    case 'object':
      if (lastKey[0] === 'mapItems') {
        const nameMap = [].concat(name, '1', 'properties');
        return <SchemaObject prefix={nameMap} data={data} showEdit={showEdit} showAdv={showAdv} />;
      }
      const nameArray = [].concat(name, 'properties');
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} />;
    default:
      return null;
  }
};

interface SchemaJsonProp {
  showEdit: (
    prefix: string[],
    editorName: string,
    propertyElement: string | { mock: string },
    type?: string
  ) => void;
  showAdv: (prefix: string[], property: Schema) => void;
}

const SchemaJson = observer((props: SchemaJsonProp): ReactElement => {
  const { showAdv, showEdit } = props;
  const mobxContext = useContext(SchemaMobxContext);

  return <div style={{ paddingTop: 8 }}>{mapping([], mobxContext.schema, showEdit, showAdv)}</div>;
});

export default SchemaJson;
