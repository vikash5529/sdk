import React, { useState, useEffect } from 'react';
import { CoreSDK, Chain, WalletProvider } from '@core-js/sdk';
import { BitcoinPlugin } from '@core-js/plugin-bitcoin';
import { TronPlugin } from '@core-js/plugin-tron';

interface WalletState {
  address: string;
  balance: string;
  chain: Chain;
  connected: boolean;
}

const initialWalletState: WalletState = {
  address: '',
  balance: '0',
  chain: Chain.ETHEREUM,
  connected: false,
};

const App: React.FC = () => {
  const [sdk, setSdk] = useState<CoreSDK | null>(null);
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const newSdk = new CoreSDK({
          projectId: 'YOUR_PROJECT_ID',
          plugins: [
            new BitcoinPlugin(),
            new TronPlugin(),
          ],
        });
        setSdk(newSdk);
      } catch (err) {
        setError('Failed to initialize SDK');
        console.error(err);
      }
    };

    initializeSDK();
  }, []);

  const handleConnect = async (provider: WalletProvider) => {
    if (!sdk) return;

    try {
      const wallet = await sdk.connect(provider);
      const address = await wallet.getAddress();
      const balance = await wallet.getBalance();
      
      setWalletState({
        address,
        balance: balance.toString(),
        chain: wallet.chain,
        connected: true,
      });
      setError('');
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    if (!sdk) return;

    try {
      await sdk.disconnect();
      setWalletState(initialWalletState);
      setError('');
    } catch (err) {
      setError('Failed to disconnect wallet');
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
                <h1 className="text-3xl font-bold text-center mb-8">Multi-Chain Wallet</h1>
                
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
                      onClick={() => handleConnect(WalletProvider.METAMASK)}
                      className="w-full bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      aria-label="Connect MetaMask"
                    >
                      Connect MetaMask
                    </button>
                    <button
                      onClick={() => handleConnect(WalletProvider.PHANTOM)}
                      className="w-full bg-purple-500 text-white rounded-lg px-4 py-2 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      aria-label="Connect Phantom"
                    >
                      Connect Phantom
                    </button>
                    <button
                      onClick={() => handleConnect(WalletProvider.TRONLINK)}
                      className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      aria-label="Connect TronLink"
                    >
                      Connect TronLink
                    </button>
                    <button
                      onClick={() => handleConnect(WalletProvider.XVERSE)}
                      className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                      aria-label="Connect Xverse"
                    >
                      Connect Xverse
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