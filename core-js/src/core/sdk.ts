import { EventEmitter } from 'events';
import { 
  SDKConfig, 
  ConnectionInfo, 
  ConnectionProvider, 
  NetworkConfig,
  SDKProvider,
  CustomChainConfig,
  CustomChainPlugin,
  ChainInterface
} from '../types';
import { PluginRegistry } from './plugin-registry';
import { BaseChain } from '../chains/base';
import { EVMChain } from '../chains/evm';
import { SolanaChain } from '../chains/solana';
import { BitcoinChain } from '../chains/bitcoin';
import { TronChain } from '../chains/tron';
import { EVMProvider, SolanaProvider, BitcoinProvider, TronProvider } from '../providers';

export enum SDKEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  NETWORK_CHANGED = 'network_changed',
  CHAIN_ADDED = 'chain_added',
  CHAIN_REMOVED = 'chain_removed'
}

export class OktoKitSDK extends BaseChain {
  private pluginRegistry: PluginRegistry;
  private chainRegistry: Map<string, ChainInterface> = new Map();
  private currentNetwork?: NetworkConfig;
  
  // Chain accessors
  public evm!: EVMChain;
  public solana!: SolanaChain;
  public bitcoin!: BitcoinChain;
  public tron!: TronChain;
  
  // Add index signature for dynamic chain properties
  [key: string]: any;
  
  constructor(config: SDKConfig) {
    super(config.networks[0], config.provider);
    this.pluginRegistry = new PluginRegistry({
      allowOverrides: false
    });
    
    // Initialize default chains
    this.initializeDefaultChains(config);
    
    // Register plugins
    if (config.plugins?.length) {
      config.plugins.forEach(plugin => {
        this.registerPlugin(plugin);
      });
    }
    
    if (config.networks.length > 0) {
      this.currentNetwork = config.networks[0];
    }
  }
  
  private initializeDefaultChains(config: SDKConfig): void {
    // Initialize EVM chain
    const evmNetwork = config.networks.find(n => n.chainType === 'evm');
    if (evmNetwork) {
      const plugin = this.pluginRegistry.findPluginForNetwork(evmNetwork);
      if (!plugin) throw new Error('No plugin found for EVM network');
      const provider = plugin.createProvider(evmNetwork) as EVMProvider;
      this.evm = new EVMChain(evmNetwork, provider);
      this.chainRegistry.set('evm', this.evm);
    }
    
    const solanaNetwork = config.networks.find(n => n.chainType === 'solana');
    if (solanaNetwork) {
      const plugin = this.pluginRegistry.findPluginForNetwork(solanaNetwork);
      if (!plugin) throw new Error('No plugin found for Solana network');
      const provider = plugin.createProvider(solanaNetwork) as SolanaProvider;
      this.solana = new SolanaChain(solanaNetwork, provider);
      this.chainRegistry.set('solana', this.solana);
    }
    
    const bitcoinNetwork = config.networks.find(n => n.chainType === 'bitcoin');
    if (bitcoinNetwork) {
      const plugin = this.pluginRegistry.findPluginForNetwork(bitcoinNetwork);
      if (!plugin) throw new Error('No plugin found for Bitcoin network');
      const provider = plugin.createProvider(bitcoinNetwork) as BitcoinProvider;
      this.bitcoin = new BitcoinChain(bitcoinNetwork, provider);
      this.chainRegistry.set('bitcoin', this.bitcoin);
    }
    
    const tronNetwork = config.networks.find(n => n.chainType === 'tron');
    if (tronNetwork) {
      const plugin = this.pluginRegistry.findPluginForNetwork(tronNetwork);
      if (!plugin) throw new Error('No plugin found for Tron network');
      const provider = plugin.createProvider(tronNetwork) as TronProvider;
      this.tron = new TronChain(tronNetwork, provider);
      this.chainRegistry.set('tron', this.tron);
    }
  }
  
  // Add support for custom chains
  addCustomChain(chainConfig: CustomChainConfig, plugin: CustomChainPlugin): void {
    const provider = plugin.createProvider(chainConfig);
    const chainInterface = new ChainInterface(provider, chainConfig);
    this.chainRegistry.set(chainConfig.chainType, chainInterface);
    
    // Add dot notation access
    Object.defineProperty(this, chainConfig.chainType, {
      get: () => chainInterface,
      enumerable: true,
      configurable: true
    });
    
    this.emit(SDKEvents.CHAIN_ADDED, chainConfig);
  }
  
  removeCustomChain(chainType: string): void {
    if (this.chainRegistry.has(chainType)) {
      this.chainRegistry.delete(chainType);
      delete this[chainType];
      this.emit(SDKEvents.CHAIN_REMOVED, chainType);
    }
  }
  
  getChain(chainType: string): ChainInterface | undefined {
    return this.chainRegistry.get(chainType);
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
  
  getConnectionInfo(): ConnectionInfo | null {
    return this.connectionInfo;
  }

  public registerPlugin(plugin: any): void {
    this.pluginRegistry.register(plugin);
  }
} 