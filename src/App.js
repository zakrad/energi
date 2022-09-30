import { Layout, Menu, Table, Col, Row, Switch } from 'antd';
import React, { useState } from 'react';
import './App.css';
import { HomeOutlined, WalletOutlined } from '@ant-design/icons';
import { AppService } from './services/api.js'
import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import Wallet from './wallet';

const appService = new AppService()

const items = [
  {
    label: 'Home',
    key: '/',
    icon: <HomeOutlined />,
  }, {
    label: 'Wallet',
    key: '/wallet',
    icon: <WalletOutlined />,
  }
]
const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const { Header, Content, Footer } = Layout;

const columns = [
  {
    title: '#',
    dataIndex: '#',
    width: '5%',
    render: (item, record, index) => {
      return <>{index + 1}</>;
    }
  },
  {
    title: 'Coin',
    dataIndex: 'name',
    render: (item, record) => {
      return <>
        <img src={`/assets/icons/${record.symbol}.svg`} width="30" alt="Logo" /> {record.name}</>;
    }
  },
  {
    title: 'Symbol',
    dataIndex: 'symbol',
    width: '15%'
  },
  {
    title: 'Price',
    dataIndex: 'last_price',
    width: '20%',
    sorter: {
      compare: (a, b) => a.last_price - b.last_price,
      multiple: 1,
    },
    render: (item) => {
      return <>${(Math.round(item * 100) / 100).toFixed(2)}</>;
    }
  },
];





function App() {

  const [assets, setAssets] = useState([])
  const navigate = useNavigate()
  const onClick = ({ key }) => {
    navigate(key)
  }

  useEffect(() => {
    async function getAssets() {
      try {
        setAssets(await appService.getAssets())
      } catch (e) {
        console.log(e)
      }
    }
    getAssets()
  }, [])

  return (
    <Layout>
      <Header
        style={{
          position: 'fixed',
          zIndex: 1,
          width: '100%',
        }}
      >
        <Menu style={{ alignItems: "center" }} onClick={onClick} theme="dark" mode="horizontal" defaultSelectedKeys={[window.location.pathname]} items={items} />
      </Header>
      <Content
        className="site-layout"
        style={{
          padding: '0 50px',
          marginTop: 64,
        }}
      >
        <Routes>
          <Route path="/" element={
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 380,
              }}
            >
              <Row>
                <Col xs={0} sm={0} md={0} lg={2} xl={6}>
                </Col>
                <Col xs={24} sm={24} md={24} lg={18} xl={12}>
                  <Table columns={columns} dataSource={assets} onChange={onChange} />
                </Col>
                <Col xs={0} sm={0} md={0} lg={2} xl={6}>
                  <Switch style={{ margin: "20px" }} checkedChildren="Dark" unCheckedChildren="Light" defaultUnChecked />
                </Col>
              </Row>
            </div>
          }>

          </Route>
          <Route path="/wallet" element={
            <Wallet />
          }>
          </Route>
        </Routes>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Zakrad | Energi
      </Footer>
    </Layout>
  );
}

export default App;
