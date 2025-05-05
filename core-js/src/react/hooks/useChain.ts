import { useCallback, useEffect, useState } from 'react';
import { useOktoKit } from '../OktoKitProvider';
import { ChainType } from '../../types';

interface ChainState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  error?: string;
}

export function useChain(chainType: ChainType) {
  const { sdk } = useOktoKit();
  const [state, setState] = useState<ChainState>({
    isConnected: false
  });

  const connect = useCallback(async () => {
    try {
      const connection = await sdk.connect('INSTALLED_WALLET', { plugin: chainType });
      const chain = sdk[chainType];
      const balance = await chain.getBalance(connection.address);

      setState({
        isConnected: true,
        address: connection.address,
        balance,
        error: undefined
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
    }
  }, [sdk, chainType]);

  const disconnect = useCallback(async () => {
    try {
      await sdk.disconnect();
      setState({
        isConnected: false,
        address: undefined,
        balance: undefined,
        error: undefined
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect'
      }));
    }
  }, [sdk]);

  const getBalance = useCallback(async (address?: string) => {
    try {
      const chain = sdk[chainType];
      const balance = await chain.getBalance(address);
      setState(prev => ({
        ...prev,
        balance
      }));
      return balance;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get balance'
      }));
      throw error;
    }
  }, [sdk, chainType]);

  const signMessage = useCallback(async (message: string) => {
    try {
      const chain = sdk[chainType];
      return await chain.signMessage(message);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sign message'
      }));
      throw error;
    }
  }, [sdk, chainType]);

  const sendTransaction = useCallback(async (transaction: any) => {
    try {
      const chain = sdk[chainType];
      return await chain.sendTransaction(transaction);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send transaction'
      }));
      throw error;
    }
  }, [sdk, chainType]);

  // Chain-specific methods
  const getChainSpecificMethod = useCallback(async () => {
    try {
      const chain = sdk[chainType];
      // Add chain-specific method calls here
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute chain-specific method'
      }));
      throw error;
    }
  }, [sdk, chainType]);

  return {
    ...state,
    connect,
    disconnect,
    getBalance,
    signMessage,
    sendTransaction,
    getChainSpecificMethod
  };
} 