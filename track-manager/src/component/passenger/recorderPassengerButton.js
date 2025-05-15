import { Modal, Button } from 'antd';
import React from 'react'
import Map from '../Map'
class RecorderPassengerButton extends React.Component {
  state = { visible: false }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  render() {
    return (
      <div>
        <Button onClick={this.showModal}>乘车记录</Button>
        <Modal
          title="订单信息"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Map points={[]}/>
        </Modal>
      </div>
    );
  }
}

export default RecorderPassengerButton;
