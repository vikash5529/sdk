/* eslint-disable @typescript-eslint/no-empty-function */
import { PluginConstructor, NetworkConfig, SDKProvider } from '../../types';

export class BitcoinPlugin implements PluginConstructor {
  name = 'bitcoin';
  chainType = 'bitcoin' as const;

  createProvider(network: NetworkConfig): SDKProvider {
    return {
      init: async () => {},
      getChainId: async () => network.id,
      getAccounts: async () => ['demo_bitcoin_address'],
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