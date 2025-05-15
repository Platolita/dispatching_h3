import React, { Component } from 'react';
import './App.css';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import LoginModal from './component/LoginModal';
import HomeController from './redux/controller/HomeController'
import DriverController from './redux/controller/DriverController'
import PassengerController from './redux/controller/PassengerController'
import OrderController from './redux/controller/OrderController'
import StatisticController from './redux/controller/StatisticController'

import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class App extends Component {


    state = {
        collapsed: false,
        mode: 'inline',
    };
    onCollapse = (collapsed) => {
        console.log(collapsed);
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline',
        });
    }
    
  render() {
    const menuKey = window.location.pathname.split('/')[1] || 'home';
    return (
        <Router>
        <Layout>
            <Sider
                collapsible
                collapsed={this.state.collapsed}
                onCollapse={this.onCollapse}
            >
                <div className="logo" />
                <Menu theme="dark" mode={this.state.mode} defaultSelectedKeys={[menuKey]}>

                    <Menu.Item key="home">
                        <Link to="/">
                     <span>
                         <Icon type="home" />
                         <span className="nav-text">首页</span>
                    </span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="statistic">
                        <Link to="/statistic">
                        <Icon type="dot-chart" />
                        <span className="nav-text">统计</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="passenger">
                        <Link to="/passenger">
                        <Icon type="user" />
                        <span className="nav-text">乘客</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="driver">
                        <Link to="/driver">
                        <Icon type="smile" />
                        <span className="nav-text">司机</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="order">
                        <Link to="/order">
                        <Icon type="file" />
                        <span className="nav-text">订单</span>
                        </Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '12px 0' }}/>
                    <LoginModal/>
                    <div style={{ padding: 24, background: '#fff', minHeight: 500 }}>
                        <Route exact path="/" component={HomeController}/>
                        <Route exact path="/driver" component={DriverController}/>
                        <Route exact path="/statistic" component={StatisticController}/>
                        <Route exact path="/order" component={OrderController}/>
                        <Route exact path="/passenger" component={PassengerController}/>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Wei Xiang/Qin Cheng/Zhou Li
                </Footer>
            </Layout>
        </Layout>
        </Router>
    );
  }
}


export default App;
