import { ref, computed } from 'vue';
import { 
  BlockchainSDK, 
  ConnectionInfo, 
  ConnectionProvider, 
  Transaction,
  SDKConfig
} from '../types';

interface UseSDKOptions extends Omit<SDKConfig, 'theme'> {
  theme?: {
    mode: 'light' | 'dark';
  };
}

export function useSDK(options: UseSDKOptions) {
  const sdk = ref<BlockchainSDK | null>(null);
  const connectionInfo = ref<ConnectionInfo | null>(null);
  const isConnecting = ref(false);
  const error = ref<Error | null>(null);

  const isConnected = computed(() => connectionInfo.value?.isConnected ?? false);
  const currentAddress = computed(() => connectionInfo.value?.address ?? null);
  const currentChainId = computed(() => connectionInfo.value?.chainId ?? null);
  const currentChainType = computed(() => connectionInfo.value?.chainType ?? null);
  const currentProviderType = computed(() => connectionInfo.value?.providerType ?? null);

  const initializeSDK = async () => {
    try {
      const sdkInstance = new BlockchainSDK({
        networks: options.networks,
        metadata: options.metadata,
        projectId: options.projectId,
        theme: options.theme,
      });
      sdk.value = sdkInstance;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to initialize SDK');
    }
  };

  const connect = async (providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET) => {
    if (!sdk.value) {
      error.value = new Error('SDK not initialized');
      return;
    }

    try {
      isConnecting.value = true;
      error.value = null;
      const info = await sdk.value.connect(providerType);
      connectionInfo.value = info;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to connect');
    } finally {
      isConnecting.value = false;
    }
  };

  const disconnect = async () => {
    if (!sdk.value) {
      error.value = new Error('SDK not initialized');
      return;
    }

    try {
      await sdk.value.disconnect();
      connectionInfo.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to disconnect');
    }
  };

  const getAccounts = async () => {
    if (!sdk.value) {
      throw new Error('SDK not initialized');
    }
    return sdk.value.getAccounts();
  };

  const getBalance = async (address?: string) => {
    if (!sdk.value) {
      throw new Error('SDK not initialized');
    }
    return sdk.value.getBalance(address);
  };

  const signMessage = async (message: string) => {
    if (!sdk.value) {
      throw new Error('SDK not initialized');
    }
    return sdk.value.signMessage(message);
  };

  const sendTransaction = async (transaction: Transaction) => {
    if (!sdk.value) {
      throw new Error('SDK not initialized');
    }
    return sdk.value.sendTransaction(transaction);
  };

  // Initialize SDK on setup
  initializeSDK();

  return {
    sdk,
    connectionInfo,
    isConnecting,
    error,
    isConnected,
    currentAddress,
    currentChainId,
    currentChainType,
    currentProviderType,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    signMessage,
    sendTransaction,
  };
} 