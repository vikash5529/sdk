import { 
  Chain,
  Connector,
  ConnectorData,
  ConnectorEvents,
  Provider,
  Web3Provider
} from 'wagmi';
import { BlockchainSDK } from '../core/sdk';
import { NetworkConfig } from '../types';

export class OktoKitWagmiConnector extends Connector {
  private sdk: BlockchainSDK;
  private network: NetworkConfig;

  constructor({
    chains,
    options,
    sdk,
    network
  }: {
    chains: Chain[];
    options: any;
    sdk: BlockchainSDK;
    network: NetworkConfig;
  }) {
    super({ chains, options });
    this.sdk = sdk;
    this.network = network;
  }

  async connect(): Promise<Required<ConnectorData>> {
    try {
      const connection = await this.sdk.connect('INSTALLED_WALLET', { 
        plugin: this.network.chainType 
      });

      const provider = this.getProvider();
      const account = connection.address;
      const chainId = Number(connection.chainId);

      this.emit('connect', { account, chainId, provider });

      return {
        account,
        chain: { id: chainId, unsupported: false },
        provider
      };
    } catch (error) {
      throw new Error('Failed to connect');
    }
  }

  async disconnect(): Promise<void> {
    await this.sdk.disconnect();
    this.emit('disconnect');
  }

  async getAccount(): Promise<string> {
    const accounts = await this.sdk[this.network.chainType].getAccounts();
    return accounts[0];
  }

  async getChainId(): Promise<number> {
    const chainId = await this.sdk[this.network.chainType].getChainId();
    return Number(chainId);
  }

  async getProvider(): Promise<Provider> {
    // Convert SDK provider to Web3Provider
    const provider = this.sdk[this.network.chainType].provider;
    return new Web3Provider(provider as any);
  }

  async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const accounts = await this.sdk[this.network.chainType].getAccounts();
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: accounts[0] });
  }

  onChainChanged(chainId: number): void {
    this.emit('change', { chain: { id: chainId, unsupported: false } });
  }

  onDisconnect(): void {
    this.emit('disconnect');
  }
}

// Wagmi configuration
export const wagmiConfig = (sdk: BlockchainSDK, networks: NetworkConfig[]) => {
  const chains = networks.map(network => ({
    id: Number(network.id),
    name: network.name,
    network: network.name.toLowerCase(),
    nativeCurrency: network.nativeCurrency,
    rpcUrls: {
      default: network.rpcUrl,
      public: network.rpcUrl
    }
  }));

  const connectors = networks.map(network => 
    new OktoKitWagmiConnector({
      chains,
      options: {},
      sdk,
      network
    })
  );

  return {
    autoConnect: true,
    connectors,
    provider: async () => {
      const defaultNetwork = networks[0];
      const provider = await sdk[defaultNetwork.chainType].provider;
      return new Web3Provider(provider as any);
    }
  };
}; 