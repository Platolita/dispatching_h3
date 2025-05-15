'use strict';
import React  from "react";
import { Table, Icon } from 'antd';
import { Button, Modal, Form, Input, Radio } from 'antd';
import { Row,Col } from 'antd';
import RecorderOrderButton from './recorderOrderButton';
const columns = [{
  title: 'ID',
  dataIndex: 'Orderid',
  key: 'Orderid',
}, {
  title: '接单出租车ID',
  dataIndex: 'Taxiid',
  key: 'Taxiid',
}, {
  title: '乘客ID',
  dataIndex: 'Passengerid',
  key: 'Passengerid',
},{
  title: '上车时间',
  dataIndex: 'StartTime',
  key: 'StartTime',
},{
  title: '价格/元',
  dataIndex: 'Price',
  key: 'Price',
},{
  title: '距离/千米',
  dataIndex: 'Distance',
  key: 'Distance',
},{
  title: '操作',
  key: 'action',
  render: (text, record) => {
    return (
      <span>
      <Col span={10} >
        <RecorderOrderButton id={text.Orderid} startTime={text.StartTime} endTime={text.EndTime}/>
      </Col>
      <Col span={10} >
        <Button type='danger'>删除</Button>
      </Col>

      </span>
    );
  },
}];

class OrderList extends React.Component{

    render(){
      return (
        <div>
        <Table columns={columns} dataSource={this.props.orders} />
        </div>
      )
    }
}

export default OrderList;
