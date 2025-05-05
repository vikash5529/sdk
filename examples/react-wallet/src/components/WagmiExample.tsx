import React from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { useEVM } from '@core-js/react/hooks/useEVM';

export function WagmiExample() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  
  const {
    balance,
    getBalance,
    getGasPrice,
    estimateGas
  } = useEVM();

  const handleConnect = async () => {
    try {
      await connect({ connector: connectors[0] });
      await getBalance(address);
      await getGasPrice();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleSendTransaction = async () => {
    try {
      const gasPrice = await getGasPrice();
      const gasEstimate = await estimateGas({
        to: '0x...',
        value: '0x...',
        gasPrice
      });
      // Send transaction using Wagmi
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Wagmi Integration Example</h2>
      
      {isConnected ? (
        <div className="space-y-4">
          <p>
            <span className="font-bold">Address:</span> {address}
          </p>
          <p>
            <span className="font-bold">Chain:</span> {chain?.name}
          </p>
          <p>
            <span className="font-bold">Balance:</span> {balance}
          </p>
          
          <div className="space-x-4">
            <button
              onClick={handleSendTransaction}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send Transaction
            </button>
            <button
              onClick={() => disconnect()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
} 