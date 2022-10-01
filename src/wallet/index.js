import { Col, Row, Button, Card, Space, Badge, Tooltip, Statistic, Typography, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from "ethers";
import { AppService } from '../services/api.js'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined, LinkOutlined, WalletTwoTone } from '@ant-design/icons';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const { Title } = Typography;
const appService = new AppService()
const gridStyle = {
    width: '100%'
};

export default function Wallet({ formatter }) {
    const { ethereum } = window
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [balance, setBalance] = useState('0')
    const [price, setPrice] = useState('0')
    const [currentAccount, setCurrentAccount] = useState()
    const [chainId, setChainId] = useState()


    useEffect(() => {
        detectEthereumProvider().then((provider) => {
            if (provider && provider.isMetaMask) {
                setIsLoading(false)
                setIsInstalled(true)
                provider.on('accountsChanged', handleAccountsChanged);
                provider.on('chainChanged', () => {
                    window.location.reload();
                });
                checkConnection();
            } else {
                setIsLoading(false)
                setIsInstalled(false)
            }
        });

        function checkConnection() {
            ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged).catch(console.error);
        }

        function handleAccountsChanged(accounts) {
            if (accounts.length === 0) {
                setIsConnected(false)
            } else if (accounts[0] !== currentAccount) {
                setIsConnected(true)
                setCurrentAccount(accounts[0])
            }
        }

        async function getPrice() {
            try {
                setPrice(await appService.getPrice())
            } catch (e) {
                console.log(e)
            }
        }

        if (isConnected) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            provider.getBalance(currentAccount).then((result) => {
                setBalance(ethers.utils.formatEther(result))
            })
            provider.getNetwork().then((result) => {
                setChainId(result.chainId)
            })
        }
        getPrice()

    }, [currentAccount, chainId, ethereum, isConnected])

    const openNotificationWithIcon = (type) => {
        notification[type]({
            message: 'Copied!'
        });
    };

    const onClickConnect = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
            .then((accounts) => {
                if (accounts.length > 0) {
                    setIsConnected(true)
                    setCurrentAccount(accounts[0])
                }
            })
            .catch((e) => console.log(e))
    }

    const changeAccount = async () => {
        await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {}
                }
            ]
        });
    }

    const changeChain = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainName: 'Energi Mainnet',
                        chainId: ethers.utils.hexlify(39797),
                        nativeCurrency: { name: 'NRG', decimals: 18, symbol: 'NRG' },
                        rpcUrls: ['https://nodeapi.energi.network']
                    }
                ]
            });
        } catch (err) {
            console.error(err)
        }
    }

    return (
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
                    {!isConnected ? <Card
                        hoverable
                        style={{
                            width: "100%",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img src={`/assets/metamask.svg`} width="250" alt="Logo" style={{
                            width: "100%",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} />
                        <>
                            {isLoading ?
                                <Button type="primary" loading>
                                    Loading
                                </Button> :
                                !isInstalled ?
                                    <Button style={{
                                        width: "100%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }} type="danger" loading={false} onClick={() => window.open("https://metamask.io/download/", '_blank').focus()}>
                                        Please Install Metamask!
                                    </Button>
                                    :
                                    <Button type="primary" shape="round" style={{
                                        width: "100%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: "#14C38E",
                                        borderColor: "#14C38E"
                                    }} loading={false} onClick={onClickConnect}>
                                        Connect to Metamask
                                    </Button>
                            }
                        </>
                    </Card> :
                        <Badge.Ribbon text={chainId !== 39797 ? 'Not Connected' : 'Connected'} color={chainId !== 39797 ? "red" : "green"}>
                            <Card
                                style={{
                                    width: "100%",
                                }}
                            >
                                <Card.Grid style={gridStyle} hoverable={false}>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: 'flex',
                                        }}>
                                        <Space align="center" >
                                            <img src={`/assets/icons/NRG2.svg`} width="40" alt="Logo" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }} />
                                            <Title level={4}>
                                                Energi Network
                                            </Title>
                                            {chainId !== 39797 ?
                                                <Button type="primary" size="large" shape="round" onClick={changeChain}>
                                                    Switch to Energi Network
                                                </Button>
                                                : ''}
                                        </Space>
                                    </div>
                                </Card.Grid>
                                <Card.Grid disabled={chainId !== 39797} style={gridStyle}>
                                    <div className="d-flex justify-content-between">
                                        <Space align="center">
                                            <img src={`/assets/metamask.svg`} width="40" alt="Logo" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }} />
                                            <Title level={4} type="secondary">
                                                {currentAccount.slice(0, 5) + "..." + currentAccount.slice(34)}
                                            </Title>
                                            <Button type="secondary" size="large" shape="circle" icon={<WalletTwoTone />} onClick={changeAccount}>
                                            </Button>
                                        </Space>
                                        <Space>
                                            <CopyToClipboard text={currentAccount}
                                                onCopy={() => openNotificationWithIcon('success')}>
                                                <Tooltip title="Copy">
                                                    <Button type="dashed" shape="circle" icon={<CopyOutlined />} size="large" />
                                                </Tooltip>
                                            </CopyToClipboard>
                                            <Tooltip title="Explorer">
                                                <Button type="dashed" loading={false} shape="circle" size="large" icon={<LinkOutlined />} onClick={() => window.open(`https://explorer.energi.network/address/${currentAccount}`, '_blank').focus()} />
                                            </Tooltip>
                                        </Space>
                                    </div>

                                </Card.Grid>
                                <Card.Grid disabled={chainId !== 39797} style={gridStyle} hoverable={false}>
                                    <div className="d-flex justify-content-between">
                                        <img src={`/assets/icons/NRG.svg`} width="60" alt="Logo" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }} />
                                        <Statistic title="NRG Balance" value={(Math.round(balance * 100) / 100).toFixed(2)} />
                                        <Statistic title="Total Balance" value={formatter.format(price * balance)} />
                                    </div>
                                </Card.Grid>
                            </Card>
                        </Badge.Ribbon>
                    }
                </Col>
                <Col xs={0} sm={0} md={0} lg={2} xl={6}>
                </Col>
            </Row>
        </div >
    )
}