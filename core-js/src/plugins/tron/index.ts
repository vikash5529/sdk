import { PluginConstructor, NetworkConfig, SDKProvider } from '../../types';

export class TronPlugin implements PluginConstructor {
  name = 'tron';
  chainType = 'tron' as const;

  createProvider(network: NetworkConfig): SDKProvider {
    return {
      init: async () => {},
      getChainId: async () => network.id,
      getAccounts: async () => ['demo_tron_address'],
      getBalance: async () => '0',
      signMessage: async (message: string) => message,
      sendTransaction: async () => 'demo_tx_hash',
      disconnect: async () => {}
    };
  }

  isSupported(network: NetworkConfig): boolean {
    return network.chainType === this.chainType;
  }
} 