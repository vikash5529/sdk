import { EventEmitter } from 'events';
import { SocialLoginAdapter } from '../auth';
import { PluginRegistry } from './plugin-registry';
import { EVMPlugin, SolanaPlugin } from '../plugins';
import { 
  AuthProviderOptions,
  ChainType,
  ConnectionInfo,
  ConnectionProvider,
  NetworkConfig,
  SDKConfig,
  SDKEvents,
  SDKProvider,
  Transaction
} from '../types';
import { ChainAdapterPluginConstructor } from '../types/plugin';

/**
 * Configuration for the SDK including plugin options
 */
export interface BlockchainSDKOptions {
  /**
   * Whether to register default plugins (EVM and Solana)
   * @default true
   */
  useDefaultPlugins?: boolean;
  
  /**
   * Whether to allow plugin overrides
   * @default false
   */
  allowPluginOverrides?: boolean;
  
  /**
   * Authentication provider options
   */
  authOptions?: AuthProviderOptions;
}

/**
 * Main SDK class that manages all blockchain interactions
 */
export class BlockchainSDK extends EventEmitter {
  private config: SDKConfig;
  private currentAdapter: SDKProvider | null = null;
  private currentNetwork: NetworkConfig | null = null;
  private connectionInfo: ConnectionInfo | null = null;
  private authOptions: AuthProviderOptions | null = null;
  private pluginRegistry: PluginRegistry;
  
  /**
   * Constructor initializes the SDK with configuration
   * @param config SDK configuration
   * @param options SDK options including plugins and auth
   */
  constructor(config: SDKConfig, options: BlockchainSDKOptions = {}) {
    super();
    this.config = config;
    this.authOptions = options.authOptions || null;
    
    // Initialize plugin registry
    this.pluginRegistry = new PluginRegistry({
      allowOverrides: options.allowPluginOverrides ?? false
    });
    
    // Register default plugins if enabled (default is true)
    if (options.useDefaultPlugins !== false) {
      this.registerDefaultPlugins();
    }
    
    // Set default network
    if (config.networks.length > 0) {
      this.currentNetwork = config.networks[0];
    }
  }
  
  /**
   * Register the default EVM and Solana plugins
   */
  private registerDefaultPlugins(): void {
    this.pluginRegistry.registerPlugin(EVMPlugin);
    this.pluginRegistry.registerPlugin(SolanaPlugin);
  }
  
  /**
   * Register a custom chain adapter plugin
   * @param pluginConstructor Constructor for the plugin
   */
  registerPlugin(pluginConstructor: ChainAdapterPluginConstructor): void {
    this.pluginRegistry.registerPlugin(pluginConstructor);
  }
  
  /**
   * Get all registered plugins
   */
  getRegisteredPlugins() {
    return this.pluginRegistry.getAllPlugins();
  }
  
  /**
   * Get the current connection information
   */
  getConnectionInfo(): ConnectionInfo | null {
    return this.connectionInfo;
  }
  
  /**
   * Get all supported networks
   */
  getNetworks(): NetworkConfig[] {
    return this.config.networks;
  }
  
  /**
   * Get the current network
   */
  getCurrentNetwork(): NetworkConfig | null {
    return this.currentNetwork;
  }
  
  /**
   * Set the current network
   * @param networkId ID of the network to set as current
   */
  setCurrentNetwork(networkId: string | number): NetworkConfig {
    const network = this.config.networks.find(n => n.id === networkId);
    if (!network) {
      throw new Error(`Network with ID ${networkId} not found`);
    }
    
    this.currentNetwork = network;
    
    if (this.connectionInfo) {
      this.emit(SDKEvents.CHAIN_CHANGED, network);
    }
    
    return network;
  }
  
  /**
   * Connect to a wallet or provider
   * @param providerType Type of connection provider
   * @param options Additional connection options
   */
  async connect(
    providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET,
    options?: unknown
  ): Promise<ConnectionInfo> {
    if (!this.currentNetwork) {
      throw new Error('Current network not set');
    }
    
    try {
      // Clear any existing connection
      if (this.currentAdapter) {
        await this.disconnect();
      }
      
      // Initialize the appropriate adapter based on provider type
      switch (providerType) {
        case ConnectionProvider.SOCIAL_LOGIN: {
          if (!this.authOptions?.socialLoginOptions) {
            throw new Error('Social login options not provided');
          }
          
          this.currentAdapter = new SocialLoginAdapter(
            this.currentNetwork,
            this.authOptions.socialLoginOptions
          );
          
          // Initialize social login adapter with client ID
          const clientId = options && typeof options === 'object' && 'clientId' in options 
            ? options.clientId as string 
            : this.config.projectId;
            
          await (this.currentAdapter as SocialLoginAdapter).init(clientId);
          
          // Connect with social login
          await (this.currentAdapter as SocialLoginAdapter).connect();
          break;
        }
        
        default: {
          // Use plugin registry to find appropriate adapter
          const plugin = this.pluginRegistry.findPluginForNetwork(this.currentNetwork);
          
          if (!plugin) {
            throw new Error(`No plugin found for network ${this.currentNetwork.name} (${this.currentNetwork.chainType})`);
          }
          
          this.currentAdapter = plugin.createProvider(this.currentNetwork);
          
          // Initialize adapter with external provider if provided
          await this.currentAdapter.init(
            options && typeof options === 'object' && 'provider' in options 
              ? options.provider 
              : undefined, 
            providerType
          );
          break;
        }
      }
      
      // Get account information
      const accounts = await this.currentAdapter.getAccounts();
      const chainId = await this.currentAdapter.getChainId();
      
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }
      
      // Update connection info
      this.connectionInfo = {
        address: accounts[0],
        chainId,
        chainType: this.currentNetwork.chainType,
        providerType,
        isConnected: true
      };
      
      // Emit connected event
      this.emit(SDKEvents.CONNECTED, this.connectionInfo);
      
      return this.connectionInfo;
    } catch (error) {
      this.emit(SDKEvents.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Disconnect the current wallet or provider
   */
  async disconnect(): Promise<void> {
    if (!this.currentAdapter) {
      return;
    }
    
    try {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
      this.connectionInfo = null;
      this.emit(SDKEvents.DISCONNECTED);
    } catch (error) {
      this.emit(SDKEvents.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Get the accounts from the current adapter
   */
  async getAccounts(): Promise<string[]> {
    if (!this.currentAdapter) {
      throw new Error('Not connected to any provider');
    }
    
    return this.currentAdapter.getAccounts();
  }
  
  /**
   * Get the balance of an address
   * @param address Optional address, uses connected account if not provided
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected to any provider');
    }
    
    return this.currentAdapter.getBalance(address);
  }
  
  /**
   * Sign a message with the current account
   * @param message Message to sign
   */
  async signMessage(message: string): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected to any provider');
    }
    
    return this.currentAdapter.signMessage(message);
  }
  
  /**
   * Send a transaction
   * @param transaction Transaction details
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.currentAdapter) {
      throw new Error('Not connected to any provider');
    }
    
    return this.currentAdapter.sendTransaction(transaction);
  }
  
  /**
   * Format a balance amount based on the current network's decimals
   * @param balance Balance to format
   * @param decimals Optional decimals override
   */
  formatBalance(balance: string, decimals?: number): string {
    if (!this.currentNetwork) {
      throw new Error('Current network not set');
    }
    
    const networkDecimals = this.currentNetwork.nativeCurrency?.decimals || 18;
    const actualDecimals = decimals !== undefined ? decimals : networkDecimals;
    
    // Basic formatting logic for different chain types
    if (this.currentNetwork.chainType === ChainType.EVM) {
      return (Number(balance) / 10 ** actualDecimals).toString();
    } else if (this.currentNetwork.chainType === ChainType.SOLANA) {
      return (Number(balance) / 10 ** actualDecimals).toString();
    }
    
    return balance;
  }
  
  /**
   * Get the explorer URL for an address or transaction
   * @param hashOrAddress Hash or address to generate URL for
   * @param type Type of URL to generate (address or transaction)
   */
  getExplorerUrl(hashOrAddress: string, type: 'address' | 'transaction' = 'address'): string {
    if (!this.currentNetwork || !this.currentNetwork.blockExplorerUrl) {
      throw new Error('Current network not set or does not have an explorer URL');
    }
    
    const baseUrl = this.currentNetwork.blockExplorerUrl.endsWith('/')
      ? this.currentNetwork.blockExplorerUrl.slice(0, -1)
      : this.currentNetwork.blockExplorerUrl;
    
    if (this.currentNetwork.chainType === ChainType.EVM) {
      return `${baseUrl}/${type}/${hashOrAddress}`;
    } else if (this.currentNetwork.chainType === ChainType.SOLANA) {
      return `${baseUrl}/${type}/${hashOrAddress}`;
    }
    
    return baseUrl;
  }
} 