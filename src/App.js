import { Layout, Menu, Table, Col, Row, Switch, Button, Input, Space } from 'antd';
import React, { useRef, useState } from 'react';
import './App.css';
import { HomeOutlined, WalletOutlined, SearchOutlined } from '@ant-design/icons';
import { AppService } from './services/api.js'
import { useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import Wallet from './wallet';
import { useThemeSwitcher } from "react-css-theme-switcher";
import Highlighter from 'react-highlight-words';

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




function App() {

  const [assets, setAssets] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const { switcher, themes } = useThemeSwitcher()
  const navigate = useNavigate()
  const onClick = ({ key }) => {
    navigate(key)
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

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
      ...getColumnSearchProps('name'),
      render: (item, record) => {
        return <>
          <img src={`/assets/icons/${record.symbol}.svg`} width="30" alt="Logo" /> {record.name}</>;
      }
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      ...getColumnSearchProps('symbol'),
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
        return <>{formatter.format(item)}</>;
      }
    },
  ];

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

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

  const toggleTheme = (isChecked) => {
    setIsDarkMode(isChecked);
    switcher({ theme: isChecked ? themes.dark : themes.light });
  };

  return (
    <Layout>
      <Header
        style={{
          position: 'fixed',
          zIndex: 1,
          width: '100%',
          display: 'flex',
        }}
      >
        <Switch style={{
          position: 'absolute',
          margin: '20px',
          right: '0px'
        }} checked={isDarkMode} checkedChildren="Dark" unCheckedChildren="Light" onChange={toggleTheme} />
        <Menu style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={onClick} theme="dark" mode="horizontal" defaultSelectedKeys={[window.location.pathname]} items={items} />
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
                </Col>
              </Row>
            </div>
          }>

          </Route>
          <Route path="/wallet" element={
            <Wallet formatter={formatter} />
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
