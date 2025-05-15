import React, { Component } from 'react';
import { points2Bpoints } from '../utils/Map';
const h3 = require('h3-js');
require('es6-promise').polyfill();
require('isomorphic-fetch');
var coordtransform = require('coordtransform');

class Map extends React.Component {
    state = { 
        drivers: [], // 存储司机数据
        passengers: [], // 存储乘客数据
        orders: [],
        mapInitialized: false,
        h3Overlays: [] // 用于存储H3网格覆盖物
    };

    fetchData = async () => {
        try {
            const driverResponse = await fetch('/track/getdriverpoints');
            const drivers = await driverResponse.json(); 
            const passengerResponse = await fetch('/track/getpassengerpoints');
            const passengers = await passengerResponse.json();
            this.setState({
                drivers: drivers.data || [],
                passengers: passengers.data || []
            }, () => {
                this.showInfo();
            });
        } catch (error) {
            console.error('获取数据失败:', error);
        }
    };
    showInfo = () => {
        const { BMap } = window;
        const { drivers, passengers } = this.state;
        
        const driversArray = drivers ? (Array.isArray(drivers) ? drivers : [drivers]) : [];
        driversArray.forEach(driverObj => {
            Object.values(driverObj).forEach(driver => {
                if (driver && driver.current_position) {
                        const point = new BMap.Point(
                            driver.current_position.lng, 
                            driver.current_position.lat
                        );
                        const driverPoint = new BMap.Marker(point, {
                            scale: 2.5 
                        });
                        const label = new BMap.Label(`司机：${driver.name}`, { 
                            offset: new BMap.Size(-35,25),
                        });
                        label.setStyle({ 
                            color: "rgba(240, 118, 18, 0.86)",
                            backgroundColor: "(250, 248, 248, 0.5)",
                            borderRadius: "10px",
                            padding: "0 10px",
                            fontSize: "14px",
                            lineHeight: "20px",
                            border: "0",
                            position: "relative",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap"
                        });
                        driverPoint.setLabel(label);
                        this.map.addOverlay(driverPoint);
                }
            });
        });
        const passengersArray = passengers ? (Array.isArray(passengers) ? passengers : [passengers]) : [];
        passengersArray.forEach(passengerObj => {
            Object.values(passengerObj).forEach(passenger => {
                if (passenger && passenger.current_position) {
                        const point = new BMap.Point(
                            passenger.current_position.lng, 
                            passenger.current_position.lat
                        );
                        const passengerPoint = new BMap.Marker(point, {
                            scale: 2.5 
                        });
                        const label = new BMap.Label(`乘客：${passenger.name}`, { 
                            offset: new BMap.Size(-35,25),
                        });
                        label.setStyle({ 
                            color: "rgba(42, 204, 204, 0.74)",
                            backgroundColor: "rgba(250, 248, 248, 0.5)",
                            borderRadius: "10px",
                            padding: "0 10px",
                            fontSize: "14px",
                            lineHeight: "20px",
                            border: "0",
                            position: "relative",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap"
                        });
                        passengerPoint.setLabel(label);
                        this.map.addOverlay(passengerPoint);
                }
            });
        });

        this.map.enableScrollWheelZoom(true);
        this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
        this.map.addControl(new BMap.MapTypeControl());
        this.map.setCurrentCity("北京");
    };

    showHeat = () => {
        const { BMap, BMapLib } = window;
        var pointArray = points2Bpoints(this.props.passengers);
        var map = new BMap.Map(this.refs.map, { enableMapClick: true });
        map.centerAndZoom(pointArray[0], 11);
        map.addControl(new BMap.MapTypeControl());
        map.enableScrollWheelZoom(true);
        var heatmapOverlay = new BMapLib.HeatmapOverlay({ "radius": 20 });
        map.addOverlay(heatmapOverlay);
        heatmapOverlay.setDataSet({ data: pointArray, max: 30 });
        heatmapOverlay.show();
    };

    showPolyline = () => {
        const { BMap } = window;
        var pointArray = points2Bpoints(this.props.orders);
        var startPoint = new BMap.Marker(pointArray[0]);
        var endPoint = new BMap.Marker(pointArray[pointArray.length - 1]);
        var polyline = new BMap.Polyline(pointArray, { strokeColor: "blue", strokeWeight: 6, strokeOpacity: 0.5 });
        var startLabel = new BMap.Label("司机", { offset: new BMap.Size(20, -10) });
        startPoint.setLabel(startLabel);
        var endLabel = new BMap.Label("乘客", { offset: new BMap.Size(20, -10) });
        endPoint.setLabel(endLabel);
        this.map.addOverlay(polyline);
        this.map.addOverlay(startPoint);
        this.map.addOverlay(endPoint);
        this.map.centerAndZoom(pointArray[0], 15);
        this.map.addControl(new BMap.MapTypeControl());
        this.map.enableScrollWheelZoom(true);
    };

    showH3Grid = () => {
        const { BMap } = window;
        const lat = 39.915; // 中心点纬度
        const lng = 116.404; // 中心点经度
        const resolution = 7; // H3索引分辨率

        const bounds = this.map.getBounds();
        const sw = bounds.getSouthWest(); // 西南角
        const ne = bounds.getNorthEast(); // 东北角

        const step = 0.005;

        for (let latlng = sw.lat; latlng <= ne.lat; latlng += step) {
            for (let lnglng = sw.lng; lnglng <= ne.lng; lnglng += step) {
                const h3Index = h3.latLngToCell(latlng, lnglng, resolution);
                const h3Indexes = [h3Index];
                const geoJson = h3.cellsToMultiPolygon(h3Indexes, true);
    
                geoJson.forEach(polygon => {
                    const path = polygon[0].map(coord => {
                        return new BMap.Point(coord[0], coord[1]);
                    });
                    const polygonOverlay = new BMap.Polygon(path, {
                        strokeColor: "blue",         // 边框颜色
                        strokeWeight: 2,             // 边框宽度
                        strokeOpacity: 0.3,          // 边框透明度
                        fillColor: "rgba(188, 227, 246, 0.2)", // 填充颜色，带透明度
                        fillOpacity: 0.2            // 填充透明度，0 为完全透明，1 为不透明
                    });
    
                    this.map.addOverlay(polygonOverlay);
                    this.setState(prevState => ({ h3Overlays: [...prevState.h3Overlays, polygonOverlay] }));
                });
            }
        }
    };
    
    

    componentDidMount() {
    const { BMap } = window;
    this.map = new BMap.Map(this.refs.map);
    this.setState({ mapInitialized: true }, () => {
        this.fetchData();
            if (this.props.type === 'heat') {
                this.showHeat();
            }
            if (this.props.showH3) {
                this.showH3Grid();
            }
            if (this.props.type === 'line' && this.props.orders.length > 0) {
                this.showPolyline();
            }
    
            // 设置地图的最大边界以限定在北京五环之内
            const sw = new BMap.Point(116.2, 39.4); // 左下角
            const ne = new BMap.Point(116.8, 40.0); // 右上角
            const bound = new BMap.Bounds(sw, ne);
            this.map.setBounds(bound);
        });
    }

    clearH3Overlays = () => {
        this.state.h3Overlays.forEach(overlay => this.map.removeOverlay(overlay));
        this.setState({ h3Overlays: [] });
    };

    componentDidUpdate(prevProps) {
        if (this.props.showH3 !== prevProps.showH3 && this.state.mapInitialized) {
            if (this.props.showH3) {
                this.showH3Grid();
            } else {
                // 清理H3网格覆盖物
                this.clearH3Overlays();
            }
        }
        if (this.props.type !== prevProps.type || this.props.orders !== prevProps.orders) {
            if (this.props.type === 'line' && this.props.orders.length > 0) {
                this.showPolyline();
            }
        }
    }

    render() {
        if (!this.state.mapInitialized) {
            return <div style={{ background: '#fff', padding: 24, minHeight: 500, position: 'relative' }} ref="map"></div>;
        }
        return (
            <div style={{ background: '#fff', padding: 24, minHeight: 500, position: 'relative' }} ref="map">
            </div>
        );
    }
}

export default Map;