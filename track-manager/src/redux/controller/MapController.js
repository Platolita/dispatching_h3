import React from "react";
import { connect } from 'react-redux';
import Map from '../../component/Map';
import { getPassenger, getDriver } from '../action/index';
import { Button, Spin } from 'antd';

class MapControllerCpnt extends React.Component {
    state = {
        showpath: false,
        showH3: false,
        drivers: [],
        passengers: [],
        orders: [],
        loading: true
    };

    showpath = () => {//司乘匹配的算法
        
    };

    showH3 = () => {
        this.setState(prevState => {
            const newShowH3 = !prevState.showH3;
            if (!newShowH3) {
                // 如果关闭H3网格，清除所有H3网格覆盖物
                this.props.clearH3Overlays();
            }
            return { showH3: newShowH3 };
        });
    };

    componentDidMount() {//获取所有的司机乘客
        Promise.all([
            getDriver(),
            getPassenger()
        ]).then(([drivers, passengers]) => {
            this.setState({ drivers, passengers, loading: false }); 
        }).catch(error => {
            console.error('Error fetching data:', error);
            this.setState({ loading: false });
        });
    }

    render() {
        const { loading } = this.state;

        return (
            <div>
                <div>
                    <Button onClick={this.showpath}>司乘匹配</Button>
                    <Button onClick={this.showH3}>h3格网</Button>
                </div>
                <Spin spinning={loading}>
                    <Map
                        points={this.props.points}
                        type='line'
                        showpath={this.state.showpath}
                        showH3={this.state.showH3}
                        drivers={this.state.drivers}
                        passengers={this.state.passengers}
                        orders={this.state.orders}
                    />
                </Spin>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        points: state.points,
        drivers: state.drivers,
        passengers: state.passengers,
        orders: state.orders,
        showH3: state.showH3
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearH3Overlays: () => dispatch({ type: 'CLEAR_H3_OVERLAYS' })
    };
};

const MapController = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapControllerCpnt);

export default MapController;