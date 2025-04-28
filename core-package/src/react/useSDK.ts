import { useEffect, useState, useCallback } from 'react';
import { 
  BlockchainSDK, 
  ConnectionInfo, 
  NetworkConfig, 
  ConnectionProvider, 
  Transaction,
  SDKConfig
} from '../types';

interface UseSDKOptions extends Omit<SDKConfig, 'theme'> {
  theme?: {
    mode: 'light' | 'dark';
  };
}

interface UseSDKReturn {
  sdk: BlockchainSDK | null;
  connectionInfo: ConnectionInfo | null;
  isConnecting: boolean;
  error: Error | null;
  connect: (providerType?: ConnectionProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  getAccounts: () => Promise<string[]>;
  getBalance: (address?: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
}

export const useSDK = (options: UseSDKOptions): UseSDKReturn => {
  const [sdk, setSDK] = useState<BlockchainSDK | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdkInstance = new BlockchainSDK({
          networks: options.networks,
          metadata: options.metadata,
          projectId: options.projectId,
          theme: options.theme,
        });
        setSDK(sdkInstance);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize SDK'));
      }
    };

    initializeSDK();
  }, [options.networks, options.metadata, options.projectId, options.theme]);

  const connect = useCallback(async (providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET) => {
    if (!sdk) {
      setError(new Error('SDK not initialized'));
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const info = await sdk.connect(providerType);
      setConnectionInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    } finally {
      setIsConnecting(false);
    }
  }, [sdk]);

  const disconnect = useCallback(async () => {
    if (!sdk) {
      setError(new Error('SDK not initialized'));
      return;
    }

    try {
      await sdk.disconnect();
      setConnectionInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect'));
    }
  }, [sdk]);

  const getAccounts = useCallback(async () => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    return sdk.getAccounts();
  }, [sdk]);

  const getBalance = useCallback(async (address?: string) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    return sdk.getBalance(address);
  }, [sdk]);

  const signMessage = useCallback(async (message: string) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    return sdk.signMessage(message);
  }, [sdk]);

  const sendTransaction = useCallback(async (transaction: Transaction) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    return sdk.sendTransaction(transaction);
  }, [sdk]);

  return {
    sdk,
    connectionInfo,
    isConnecting,
    error,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    signMessage,
    sendTransaction,
  };
}; 