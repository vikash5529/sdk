import React, { useState, useEffect } from "react";
import {
  BlockchainSDK,
  ChainType,
  ConnectionProvider,
  SDKConfig,
  NetworkConfig,
  BitcoinPlugin,
  TronPlugin
} from "@core-js/sdk";
import { CustomChainPlugin } from "./plugins/custom-chain";

type MyChainTypes = 'evm' | 'bitcoin' | 'tron' | 'custom_chain';

interface WalletState {
  address: string;
  balance: string;
  chain: ChainType;
  connected: boolean;
}

const initialWalletState: WalletState = {
  address: "",
  balance: "0",
  chain: "evm",
  connected: false,
};

const networks: NetworkConfig<MyChainTypes>[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    chainType: "evm",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: "mainnet",
    name: "Bitcoin Mainnet",
    chainType: "bitcoin",
    rpcUrl: "https://blockstream.info/api/",
  },
  {
    id: "mainnet",
    name: "Tron Mainnet",
    chainType: "tron",
    rpcUrl: "https://api.trongrid.io",
  },
  {
    id: "custom_1",
    name: "Custom Chain",
    chainType: "custom_chain",
    rpcUrl: "https://custom-chain-rpc.com",
  }
];

const sdkConfig: SDKConfig<MyChainTypes> = {
  projectId: "YOUR_PROJECT_ID",
  networks,
  metadata: {
    name: "Multi-Chain Wallet Example",
    description: "Example wallet application using Core JS SDK",
    url: "http://localhost:3000",
    icons: [],
  },
  plugins: [
    new BitcoinPlugin(),
    new TronPlugin(),
    new CustomChainPlugin()
  ],
};

const App: React.FC = () => {
  const [sdk, setSdk] = useState<BlockchainSDK<MyChainTypes> | null>(null);
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [error, setError] = useState<string>("");
  const [customChainData, setCustomChainData] = useState<any>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const newSdk = new BlockchainSDK<MyChainTypes>(sdkConfig);
        setSdk(newSdk);
      } catch (err) {
        setError("Failed to initialize SDK");
        console.error(err);
      }
    };

    initializeSDK();
  }, []);

  const handleConnect = async (provider: ConnectionProvider, chainType: ChainType) => {
    if (!sdk) return;

    try {
      const connection = await sdk.connect(provider, { plugin: chainType });

      // Use chain-specific methods
      let balance = "0";
      switch (chainType) {
        case 'evm':
          balance = await sdk.evm.getBalance(connection.address);
          break;
        case 'bitcoin':
          balance = await sdk.bitcoin.getBalance(connection.address);
          break;
        case 'tron':
          balance = await sdk.tron.getBalance(connection.address);
          break;
        case 'custom_chain':
          balance = await sdk.custom_chain.getBalance(connection.address);
          const customData = await sdk.custom_chain.customMethod();
          setCustomChainData(customData);
          break;
      }

      setWalletState({
        address: connection.address,
        balance,
        chain: connection.chainType,
        connected: connection.isConnected,
      });

      setError("");
    } catch (err) {
      setError("Failed to connect wallet");
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    if (!sdk) return;

    try {
      await sdk.disconnect();
      setWalletState(initialWalletState);
      setCustomChainData(null);
      setError("");
    } catch (err) {
      setError("Failed to disconnect wallet");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">
                  Multi-Chain Wallet
                </h1>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {walletState.connected ? (
                  <div className="space-y-4">
                    <p>
                      <span className="font-bold">Chain:</span> {walletState.chain}
                    </p>
                    <p>
                      <span className="font-bold">Address:</span> {walletState.address}
                    </p>
                    <p>
                      <span className="font-bold">Balance:</span> {walletState.balance}
                    </p>
                    {customChainData && (
                      <div className="mt-4 p-4 bg-gray-50 rounded">
                        <h3 className="font-bold mb-2">Custom Chain Data:</h3>
                        <pre className="text-sm">{JSON.stringify(customChainData, null, 2)}</pre>
                      </div>
                    )}
                    <button
                      onClick={handleDisconnect}
                      className="w-full bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      aria-label="Disconnect wallet"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => handleConnect(ConnectionProvider.INSTALLED_WALLET, 'evm')}
                      className="w-full bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      aria-label="Connect MetaMask"
                    >
                      Connect MetaMask
                    </button>
                    <button
                      onClick={() => handleConnect(ConnectionProvider.INSTALLED_WALLET, 'bitcoin')}
                      className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                      aria-label="Connect Xverse"
                    >
                      Connect Xverse
                    </button>
                    <button
                      onClick={() => handleConnect(ConnectionProvider.INSTALLED_WALLET, 'tron')}
                      className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      aria-label="Connect TronLink"
                    >
                      Connect TronLink
                    </button>
                    <button
                      onClick={() => handleConnect(ConnectionProvider.INSTALLED_WALLET, 'custom_chain')}
                      className="w-full bg-purple-500 text-white rounded-lg px-4 py-2 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      aria-label="Connect Custom Chain"
                    >
                      Connect Custom Chain
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
