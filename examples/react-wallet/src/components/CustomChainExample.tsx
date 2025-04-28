import React, { useState } from 'react';
import { BlockchainSDK, CustomChainConfig, CustomChainPlugin, NetworkConfig } from "@core-js/sdk";

// Example custom chain configuration
const customChainConfig: CustomChainConfig = {
  id: "custom_chain_1",
  name: "My Custom Chain",
  chainType: "custom_chain",
  rpcUrl: "https://custom-chain-rpc.com",
  customRpcUrl: "https://custom-chain-rpc.com",
  customExplorerUrl: "https://custom-chain-explorer.com",
  customFeatures: {
    supportsSmartContracts: true,
    nativeToken: "CUSTOM"
  }
};

// Example custom chain plugin
const customChainPlugin: CustomChainPlugin = {
  name: "custom_chain_plugin",
  chainType: "custom_chain",
  createProvider: (network: CustomChainConfig) => ({
    init: async () => {
      console.log(`Initializing custom chain: ${network.name}`);
    },
    getChainId: async () => network.id,
    getAccounts: async () => ['custom_chain_address'],
    getBalance: async () => '1000',
    signMessage: async (message: string) => message,
    sendTransaction: async () => 'custom_tx_hash',
    disconnect: async () => {},
    // Custom method specific to this chain
    customMethod: async () => {
      return { customData: 'Custom chain specific data' };
    }
  }),
  isSupported: (network: NetworkConfig) => network.chainType === "custom_chain"
};

export const CustomChainExample: React.FC = () => {
  const [sdk] = useState(() => new BlockchainSDK({
    projectId: "YOUR_PROJECT_ID",
    networks: [],
    metadata: {
      name: "Custom Chain Example",
      description: "Example of using custom chains",
      url: "http://localhost:3000",
      icons: [],
    },
    plugins: []
  }));

  const [customChain, setCustomChain] = useState<CustomChainConfig | null>(null);
  const [balance, setBalance] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAddCustomChain = () => {
    try {
      sdk.addCustomChain(customChainConfig, customChainPlugin);
      setCustomChain(customChainConfig);
      setError("");
    } catch (err) {
      setError("Failed to add custom chain");
      console.error(err);
    }
  };

  const handleGetBalance = async () => {
    try {
      const chain = sdk.getCustomChain("custom_chain");
      if (chain) {
        const accounts = await chain.getAccounts();
        if (accounts.length > 0) {
          const balance = await chain.getBalance(accounts[0]);
          setBalance(balance);
        }
      }
      setError("");
    } catch (err) {
      setError("Failed to get balance");
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Custom Chain Example</h2>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!customChain ? (
        <button
          onClick={handleAddCustomChain}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Custom Chain
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{customChain.name}</h3>
            <p className="text-gray-600">Chain ID: {customChain.id}</p>
            <p className="text-gray-600">RPC URL: {customChain.rpcUrl}</p>
            <p className="text-gray-800 font-medium">Balance: {balance || 'Not fetched'}</p>
          </div>
          
          <button
            onClick={handleGetBalance}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Get Balance
          </button>
        </div>
      )}
    </div>
  );
}; 