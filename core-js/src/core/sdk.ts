import { EventEmitter } from 'events';
import { 
  SDKConfig, 
  ConnectionInfo, 
  ConnectionProvider, 
  NetworkConfig,
  Transaction,
  SDKProvider
} from '../types';
import { PluginRegistry } from './plugin-registry';

export enum SDKEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  NETWORK_CHANGED = 'network_changed'
}

export class BlockchainSDK extends EventEmitter {
  private config: SDKConfig;
  private currentAdapter: SDKProvider | null = null;
  private currentNetwork: NetworkConfig | null = null;
  private connectionInfo: ConnectionInfo | null = null;
  private pluginRegistry: PluginRegistry;

  constructor(config: SDKConfig, options: { allowPluginOverrides?: boolean } = {}) {
    super();
    this.config = config;
    this.pluginRegistry = new PluginRegistry({
      allowOverrides: options.allowPluginOverrides ?? false
    });
    
    if (config.plugins?.length) {
      config.plugins.forEach(plugin => {
        this.pluginRegistry.registerPlugin(plugin);
      });
    }
    
    if (config.networks.length > 0) {
      this.currentNetwork = config.networks[0];
    }
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