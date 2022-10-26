import React, { useEffect, useState } from 'react';
import JsonSchemaEditor from '@yy/json-schema-editor-antd';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types,no-console */
// noinspection NpmUsedModulesInstalled

export default () => {
  const [val, setVal] = useState();
  useEffect(() => {
    setVal({
      type: 'object',
      typeName: 'Test1Req',
      description: '请求描述',
      properties: { uid: { type: 'uint32', typeName: null, description: '用户uid' } },
      required: ['uid'],
    });
  }, []);

  useEffect(() => {
    console.log('val:', JSON.stringify(val));
  }, [val]);

  return (
    <div style={{ width: '90%' }}>
      <JsonSchemaEditor
        jsonEditor={false}
        data={val}
        onChange={(value) => {
          setVal(value);
        }}
      />
    </div>
  );
};
