import { Col, Row, Button, Card } from 'antd';
import React, { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from "ethers";
import { AppService } from '../services/api.js'

const appService = new AppService()

export default function Wallet() {
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

    }, [currentAccount, chainId])


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
                <Col span={12} offset={6}>
                    <Card
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
                                    <Button type="danger" loading={false} onClick={() => window.open("https://metamask.io/download/", '_blank').focus()}>
                                        Please Install Metamask!
                                    </Button>
                                    : !isConnected ?
                                        <Button type="primary" shape="round" style={{ background: "#14C38E", borderColor: "#14C38E" }} loading={false} onClick={onClickConnect}>
                                            Connect to Metamask
                                        </Button>
                                        : chainId !== 39797 ?
                                            <Button type="primary" loading={false} onClick={changeChain}>
                                                Wrong Netwrok
                                            </Button>
                                            :
                                            <Button type="primary" loading={false} onClick={changeAccount}>
                                                {currentAccount} {chainId} {balance} {price}
                                            </Button>
                            }
                        </>

                    </Card>
                </Col>
            </Row>
        </div>
    )


}