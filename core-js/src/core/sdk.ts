import { EventEmitter } from 'events';
import { 
  SDKConfig, 
  ConnectionInfo, 
  ConnectionProvider, 
  NetworkConfig,
  Transaction,
  SDKProvider,
  CustomChainConfig,
  CustomChainPlugin,
} from '../types';
import { PluginRegistry } from './plugin-registry';
import { ChainInterface } from './chain-interface';

export enum SDKEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  NETWORK_CHANGED = 'network_changed',
  CHAIN_ADDED = 'chain_added',
  CHAIN_REMOVED = 'chain_removed'
}

export class BlockchainSDK<T extends string = string> extends EventEmitter {
  private currentAdapter: SDKProvider | null = null;
  private currentNetwork: NetworkConfig<T> | null = null;
  private connectionInfo: ConnectionInfo | null = null;
  private pluginRegistry: PluginRegistry<T>;
  private customChains: Map<string, ChainInterface> = new Map();
  private chainInterfaces: Map<string, ChainInterface> = new Map();
  
  // Add index signature for dynamic chain properties
  [key: string]: any;
  
  // Chain interfaces
  readonly bitcoin: ChainInterface;
  readonly tron: ChainInterface;
  readonly evm: ChainInterface;

  constructor(config: SDKConfig<T>) {
    super();
    this.pluginRegistry = new PluginRegistry({
      allowOverrides: false
    });
    
    if (config.plugins?.length) {
      config.plugins.forEach(plugin => {
        this.pluginRegistry.registerPlugin(plugin);
        const network = config.networks.find(n => n.chainType === plugin.chainType);
        if (network) {
          const provider = plugin.createProvider(network);
          const chainInterface = new ChainInterface(provider, network);
          this.chainInterfaces.set(plugin.chainType, chainInterface);
          
          Object.defineProperty(this, plugin.chainType, {
            get: () => chainInterface,
            enumerable: true,
            configurable: true
          });
        }
      });
    }
    
    if (config.networks.length > 0) {
      this.currentNetwork = config.networks[0];
    }
  }

  // Add support for custom chains
  addCustomChain(chainConfig: CustomChainConfig, plugin: CustomChainPlugin): void {
    const provider = plugin.createProvider(chainConfig);
    const chainInterface = new ChainInterface(provider, chainConfig);
    this.customChains.set(chainConfig.chainType, chainInterface);
    this.emit(SDKEvents.CHAIN_ADDED, chainConfig);
  }

  removeCustomChain(chainType: string): void {
    if (this.customChains.has(chainType)) {
      this.customChains.delete(chainType);
      this.emit(SDKEvents.CHAIN_REMOVED, chainType);
    }
  }

  getCustomChain(chainType: string): ChainInterface | undefined {
    return this.customChains.get(chainType);
  }

  async connect(
    providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET,
    options?: { plugin?: string }
  ): Promise<ConnectionInfo> {
    if (!this.currentNetwork) {
      throw new Error('Current network not set');
    }

    try {
      if (this.currentAdapter) {
        await this.disconnect();
      }

      const plugin = options?.plugin 
        ? this.pluginRegistry.getPluginByName(options.plugin)
        : this.pluginRegistry.findPluginForNetwork(this.currentNetwork);

      if (!plugin) {
        throw new Error(`No suitable plugin found for network ${this.currentNetwork.name}`);
      }

      this.currentAdapter = plugin.createProvider(this.currentNetwork);
      await this.currentAdapter.init(undefined, providerType);

      const accounts = await this.currentAdapter.getAccounts();
      const chainId = await this.currentAdapter.getChainId();

      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }

      this.connectionInfo = {
        address: accounts[0],
        chainId,
        chainType: this.currentNetwork.chainType,
        providerType,
        isConnected: true
      };

      this.emit(SDKEvents.CONNECTED, this.connectionInfo);
      return this.connectionInfo;
    } catch (error) {
      this.emit(SDKEvents.ERROR, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.currentAdapter) {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
      this.connectionInfo = null;
      this.emit(SDKEvents.DISCONNECTED);
    }
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected');
    }
    return this.currentAdapter.getBalance(address);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected');
    }
    return this.currentAdapter.signMessage(message);
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected');
    }
    return this.currentAdapter.sendTransaction(transaction);
  }

  getConnectionInfo(): ConnectionInfo | null {
    return this.connectionInfo;
  }
} 