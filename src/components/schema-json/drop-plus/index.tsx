import React, { ReactElement, useContext } from 'react';
import { Dropdown, Menu, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { PlusOutlined } from '@ant-design/icons';
import { SchemaMobxContext } from '../../..';

interface DropPlusProp {
  prefix: string[];
  name: string;
}

const DropPlus = observer((props: DropPlusProp): ReactElement => {
  const { prefix, name } = props;

  const context = useContext(SchemaMobxContext);

  const menu = (
    <Menu
      items={[
        {
          label: (
            <span
              onClick={() => {
                context.addField({ keys: prefix, name });
              }}
            >
              添加兄弟节点
            </span>
          ),
          key: '添加兄弟节点',
        },
        {
          label: (
            <span
              onClick={() => {
                context.setOpenValue({
                  key: prefix.concat(name, 'properties'),
                  value: true,
                });
                context.addChildField({ keys: prefix.concat(name, 'properties') });
              }}
            >
              添加子节点
            </span>
          ),
          key: '添加子节点',
        },
      ]}
    />
  );

  return (
    <Tooltip placement="top" title="添加节点">
      <Dropdown overlay={menu}>
        <PlusOutlined style={{ color: '#2395f1' }} />
      </Dropdown>
    </Tooltip>
  );
});

export default DropPlus;
