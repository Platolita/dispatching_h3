import {address} from '../../config/config';
import { message } from 'antd';
import {getPointById,fetchAllPassenger,fetchAllDriver,fetchAllOrder} from '../../api/api';
const initPoints = (points) => (
    {
        type: 'GET_POINTS',
        data: points
    }
);
export const fetchPoints = (index) => {//获取点（通过id获取轨迹点）
    return (dispatch) => {
        return getPointById(index).then((json) =>  {
                dispatch(initPoints(json));
                });
    }
};

export const Match = (index) => {//司乘匹配的逻辑
    

};

export const addPassenger= (passenger) =>{//添加乘客
    return{
        type:'ADD_PASSENGER',
        passenger
    }
}

export const deletePassenger= (id) =>{//删除乘客
    return{
        type:'DELETE_PASSENGER',
        id
    }
}

const getAllPassenger = (passengers) => (//获取乘客列表
    {
        type: 'GET_ALL_PASSENGERS',
        data: passengers
    }
);               
export const getPassenger = () => {//获取乘客
    return (dispatch) => {
        return fetchAllPassenger().then((json) =>  {                
                dispatch(getAllPassenger(json));
                });
    }
};

export const addDriver= (driver) =>{
    return{
        type:'ADD_DRIVER',
        driver
    }
}
const getAllDriver = (drivers) => (
    {
        type: 'GET_ALL_DRIVER',
        data: drivers
    }
);
export const getDriver = () => {
    return (dispatch) => {
        return fetchAllDriver().then((json) =>  {
                dispatch(getAllDriver(json));
                });
    }
};

export const addOrder= (order) =>{
    return{
        type:'ADD_ORDER',
        order
    }
}
const getAllOrder = (orders) => (
    {
        type: 'GET_ALL_ORDER',
        data: orders
    }
);
export const getOrder = () => {
    return (dispatch) => {
        return fetchAllOrder().then((json) =>  {
                dispatch(getAllOrder(json));
                });
    }
};
