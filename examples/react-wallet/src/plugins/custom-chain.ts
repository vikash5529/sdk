import { PluginConstructor, NetworkConfig, SDKProvider } from "@core-js/sdk";

export class CustomChainPlugin implements PluginConstructor {
  name = 'custom_chain';
  chainType = 'custom_chain' as const;

  createProvider(network: NetworkConfig): SDKProvider {
    return {
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
    };
  }

  isSupported(network: NetworkConfig): boolean {
    return network.chainType === this.chainType;
  }
} 