import React, { useEffect, useState } from 'react';
import { BlockchainSDK, SDKConfig, NetworkConfig, BitcoinPlugin, TronPlugin } from "@core-js/sdk";

// Network configurations
const networks: NetworkConfig[] = [
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
  }
];

const sdkConfig: SDKConfig = {
  projectId: "YOUR_PROJECT_ID",
  networks,
  metadata: {
    name: "Multi-Chain Balance Checker",
    description: "Example of checking balances across chains",
    url: "http://localhost:3000",
    icons: [],
  },
  plugins: [new BitcoinPlugin(), new TronPlugin()],
};

interface ChainBalance {
  chain: string;
  balance: string;
  address: string;
}

export const MultiChainBalance: React.FC = () => {
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const sdk = new BlockchainSDK(sdkConfig);
        const chainBalances: ChainBalance[] = [];

        // Bitcoin balance
        try {
          const accounts = await sdk.bitcoin.getAccounts();
          if (accounts.length > 0) {
            chainBalances.push({
              chain: 'Bitcoin',
              balance: await sdk.bitcoin.getBalance(accounts[0]),
              address: accounts[0]
            });
          }
        } catch (e) {
          console.error('Bitcoin balance fetch failed:', e);
        }

        // Tron balance
        try {
          const accounts = await sdk.tron.getAccounts();
          if (accounts.length > 0) {
            chainBalances.push({
              chain: 'Tron',
              balance: await sdk.tron.getBalance(accounts[0]),
              address: accounts[0]
            });
          }
        } catch (e) {
          console.error('Tron balance fetch failed:', e);
        }

        // EVM balance
        try {
          const accounts = await sdk.evm.getAccounts();
          if (accounts.length > 0) {
            chainBalances.push({
              chain: 'Ethereum',
              balance: await sdk.evm.getBalance(accounts[0]),
              address: accounts[0]
            });
          }
        } catch (e) {
          console.error('EVM balance fetch failed:', e);
        }

        setBalances(chainBalances);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Multi-Chain Balances</h2>
      {balances.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg">{item.chain}</h3>
          <p className="text-gray-600 truncate">Address: {item.address}</p>
          <p className="text-gray-800 font-medium">Balance: {item.balance}</p>
        </div>
      ))}
    </div>
  );
}; 