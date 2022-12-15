import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Checkbox, Col, Input, Row, Select, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { SchemaMobxContext } from '../../..';
import { EditorContext } from '../../editor';
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE, MAP_SCHEMA_TYPE } from '../../../constants';
import MockSelect from '../../mock-select';
import { mapping } from '../index';
import Schema from '../../../types/Schema';

interface SchemaMapProp {
  data: Schema;
  prefix: string[];
  showEdit: (
    editorName: string[],
    prefix: string,
    propertyElement: string | { mock: string },
    type?: string
  ) => void;
  showAdv: (prefix: string[], property: Schema) => void;
}

const SchemaMap = observer((props: SchemaMapProp): ReactElement => {
  const { data, prefix, showAdv, showEdit } = props;
  // console.log('data:', data);
  // noinspection DuplicatedCode
  const [tagPaddingLeftStyle, setTagPaddingLeftStyle] = useState<CSSProperties>({});

  const context = useContext(EditorContext);
  const mobxContext = useContext(SchemaMobxContext);

  useEffect(() => {
    const length = props.prefix.filter((name) => name !== 'properties').length;
    // console.log('map useEffect props.prefix:', props.prefix);
    setTagPaddingLeftStyle({
      paddingLeft: `${20 * (length + 1)}px`,
    });
  }, [props.prefix]);

  const getPrefix = (num: string) => {
    return [].concat(prefix, 'mapItems', num);
  };

  // 修改数据类型
  const handleChangeType = (num: string, value: string) => {
    // console.log('num:', num);
    // console.log('schema-map修改数据类型');
    const keys = getPrefix(num).concat('type');
    // console.log('keys:', keys);
    // console.log('value:', value);
    mobxContext.changeType({ keys, value });
  };

  // 修改备注信息
  const handleChangeDesc = (num, value) => {
    const key = getPrefix(num).concat(`description`);
    mobxContext.changeValue({ keys: key, value });
  };

  // 修改mock信息
  const handleChangeMock = (num, e: string) => {
    const key = getPrefix(num).concat('mock');
    const value = e ? { mock: e } : '';
    mobxContext.changeValue({ keys: key, value });
  };

  const handleChangeTypeName = (num, value) => {
    const key = getPrefix(num).concat('typeName');
    mobxContext.changeValue({ keys: key, value });
  };

  // 增加子节点
  const handleAddChildField = (num) => {
    // console.log('map增加子节点');
    const keyArr = getPrefix(num).concat('properties');
    // console.log('map key应该有num:', keyArr);
    mobxContext.addChildField({ keys: keyArr });
    mobxContext.setOpenValue({ key: keyArr, value: true });
  };

  const handleClickIcon = (num) => {
    // 数据存储在 properties.name.properties下
    const keyArr = getPrefix(num).concat('properties');
    mobxContext.setOpenValue({ key: keyArr });
  };

  const handleShowEdit = (num: string, name: string, type?: string) => {
    // console.log('handleShowEdit:', data.mapItems);
    showEdit(getPrefix(num), name, data.mapItems[name], type);
  };

  const handleShowAdv = (num) => {
    showAdv(getPrefix(num), data.mapItems[0]);
  };

  const mapItems = data.mapItems;
  const prefixArray = [].concat(prefix, 'mapItems');

  const prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);

  return data.mapItems !== undefined ? (
    <div>
      <div>
        <Row gutter={11} justify="space-around" align="middle">
          <Col flex="auto">
            <Row gutter={11} justify="space-around" align="middle">
              <Col span={7} style={tagPaddingLeftStyle}>
                <Row justify="space-around" align="middle" className="field-name">
                  <Col flex="20px">
                    {mapItems[0].type === 'object' ? (
                      <span
                        className="show-hide-children"
                        onClick={handleClickIcon.bind(this, '0')}
                      >
                        {_.get(mobxContext.open, [prefixArrayStr]) ? (
                          <CaretDownOutlined />
                        ) : (
                          <CaretRightOutlined />
                        )}
                      </span>
                    ) : null}
                  </Col>
                  <Col flex="auto">
                    <Input
                      addonAfter={<Checkbox style={{ paddingLeft: 0 }} disabled checked />}
                      disabled
                      value="Key"
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={context.mock ? 3 : 5}>
                <Select
                  style={{ width: '100%' }}
                  onChange={handleChangeType.bind(this, '0')}
                  value={mapItems[0].type}
                >
                  {MAP_SCHEMA_TYPE.map((item, index) => {
                    return (
                      <Select.Option value={item} key={index}>
                        {item}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Col>
              {context.mock && (
                <Col span={3}>
                  <MockSelect
                    schema={mapItems[0]}
                    showEdit={() => handleShowEdit('0', 'mock', mapItems[0].type)}
                    onChange={handleChangeMock.bind(this, '0')}
                  />
                </Col>
              )}
              <Col span={context.mock ? 5 : 6}>
                <Input
                  addonAfter={
                    <EditOutlined
                      className="input_icon_editor"
                      onClick={() => handleShowEdit('0', 'typeName')}
                    />
                  }
                  placeholder="typeName"
                  value={mapItems[0].typeName}
                  onChange={(event) => handleChangeTypeName('0', event.target.value)}
                />
              </Col>
              <Col span={context.mock ? 5 : 6}>
                <Input
                  addonAfter={
                    <EditOutlined
                      className="input_icon_editor"
                      onClick={() => handleShowEdit('0', 'description')}
                    />
                  }
                  placeholder="description"
                  value={mapItems[0].description}
                  onChange={(event) => handleChangeDesc('0', event.target.value)}
                />
              </Col>
            </Row>
          </Col>
          <Col flex="66px">
            <Row gutter={8}>
              <Col span={8} style={{ display: 'none' }}>
                <span className="adv-set" onClick={handleShowAdv.bind(this, '0')}>
                  <Tooltip placement="top" title="adv_setting">
                    <SettingOutlined />
                  </Tooltip>
                </span>
              </Col>
              <Col span={8}>
                {mapItems[0].type === 'object' ? (
                  <span className="plus" onClick={handleAddChildField.bind(this, '0')}>
                    <Tooltip placement="top" title="添加子节点">
                      <PlusOutlined />
                    </Tooltip>
                  </span>
                ) : null}
              </Col>
            </Row>
          </Col>
        </Row>
        <div style={{ paddingTop: 8 }}>{mapping(prefixArray, mapItems[0], showEdit, showAdv)}</div>
      </div>
      <div>
        <Row gutter={11} justify="space-around" align="middle">
          <Col flex="auto">
            <Row gutter={11} justify="space-around" align="middle">
              <Col span={7} style={tagPaddingLeftStyle}>
                <Row justify="space-around" align="middle" className="field-name">
                  <Col flex="20px">
                    {mapItems[1].type === 'object' ? (
                      <span
                        className="show-hide-children"
                        onClick={handleClickIcon.bind(this, '1')}
                      >
                        {_.get(mobxContext.open, [prefixArrayStr]) ? (
                          <CaretDownOutlined />
                        ) : (
                          <CaretRightOutlined />
                        )}
                      </span>
                    ) : null}
                  </Col>
                  <Col flex="auto">
                    <Input
                      addonAfter={<Checkbox style={{ paddingLeft: 0 }} disabled checked />}
                      disabled
                      value="Value"
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={context.mock ? 3 : 5}>
                <Select
                  style={{ width: '100%' }}
                  onChange={handleChangeType.bind(this, '1')}
                  value={mapItems[1].type}
                >
                  {SCHEMA_TYPE.map((item, index) => {
                    return (
                      <Select.Option value={item} key={index}>
                        {item}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Col>
              {context.mock && (
                <Col span={3}>
                  <MockSelect
                    schema={mapItems[1]}
                    showEdit={() => handleShowEdit('1', 'mock', mapItems[1].type)}
                    onChange={handleChangeMock.bind(this, '1')}
                  />
                </Col>
              )}
              <Col span={context.mock ? 5 : 6}>
                <Input
                  addonAfter={
                    <EditOutlined
                      className="input_icon_editor"
                      onClick={() => handleShowEdit('1', 'typeName')}
                    />
                  }
                  placeholder="typeName"
                  value={mapItems[1].typeName}
                  onChange={(event) => handleChangeTypeName('1', event.target.value)}
                />
              </Col>
              <Col span={context.mock ? 5 : 6}>
                <Input
                  addonAfter={
                    <EditOutlined
                      className="input_icon_editor"
                      onClick={() => handleShowEdit('1', 'description')}
                    />
                  }
                  placeholder="description"
                  value={mapItems[1].description}
                  onChange={(event) => handleChangeDesc('1', event.target.value)}
                />
              </Col>
            </Row>
          </Col>
          <Col flex="66px">
            <Row gutter={8}>
              <Col span={8} style={{ display: 'none' }}>
                <span className="adv-set" onClick={handleShowAdv.bind(this, '1')}>
                  <Tooltip placement="top" title="adv_setting">
                    <SettingOutlined />
                  </Tooltip>
                </span>
              </Col>
              <Col span={8}>
                {mapItems[1].type === 'object' ? (
                  <span className="plus" onClick={handleAddChildField.bind(this, '1')}>
                    <Tooltip placement="top" title="添加子节点">
                      <PlusOutlined />
                    </Tooltip>
                  </span>
                ) : null}
              </Col>
            </Row>
          </Col>
        </Row>
        <div style={{ paddingTop: 8 }}>{mapping(prefixArray, mapItems[1], showEdit, showAdv)}</div>
      </div>
    </div>
  ) : (
    <></>
  );
});

export default SchemaMap;
