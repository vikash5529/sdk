/**
 * ChainType enum to differentiate between EVM and Solana chains
 */
export enum ChainType {
  EVM = 'evm',
  SOLANA = 'solana'
}

/**
 * Network information interface for chain configurations
 */
export interface NetworkConfig {
  id: string | number;
  name: string;
  chainType: ChainType;
  rpcUrl: string;
  blockExplorerUrl?: string;
  iconUrl?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Metadata interface for project information
 */
export interface SDKMetadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  // Add more theme properties as needed
}

/**
 * Configuration interface for the SDK initialization
 */
export interface SDKConfig {
  networks: NetworkConfig[];
  metadata: SDKMetadata;
  projectId: string;
  theme?: ThemeConfig;
}

/**
 * Connection provider type
 */
export enum ConnectionProvider {
  INSTALLED_WALLET = 'INSTALLED_WALLET',
  EXTERNAL_WALLET = 'EXTERNAL_WALLET',
  SOCIAL_LOGIN = 'SOCIAL_LOGIN'
}

/**
 * Social login provider enum
 */
export enum SocialLoginProvider {
  GOOGLE = 'google',
  TWITTER = 'twitter',
  GITHUB = 'github',
  DISCORD = 'discord',
  EMAIL_PASSWORDLESS = 'email_passwordless'
}

/**
 * Connection interface that represents a connected account
 */
export interface ConnectionInfo {
  address: string;
  chainId: string | number;
  chainType: ChainType;
  providerType: ConnectionProvider;
  isConnected: boolean;
}

/**
 * Transaction interface for sending transactions
 */
export interface Transaction {
  to: string;
  value?: string;
  data?: string;
}

/**
 * Wallet interface for external wallets
 */
export interface WalletInfo {
  name: string;
  icon: string;
  description?: string;
  installed?: boolean;
  type: ConnectionProvider;
}

/**
 * Provider interface for the SDK provider
 */
export interface SDKProvider {
  /**
   * Initialize the provider with options
   * @param options Any provider-specific options
   * @param providerType The type of connection provider
   */
  init(options?: unknown, providerType?: ConnectionProvider): Promise<void>;
  
  /**
   * Get the chain ID
   */
  getChainId(): Promise<string | number>;
  
  /**
   * Get connected accounts
   */
  getAccounts(): Promise<string[]>;
  
  /**
   * Get balance of an address
   * @param address Optional address, uses connected account if not provided
   */
  getBalance(address?: string): Promise<string>;
  
  /**
   * Sign a message
   * @param message Message to sign
   */
  signMessage(message: string): Promise<string>;
  
  /**
   * Send a transaction
   * @param transaction Transaction details
   */
  sendTransaction(transaction: Transaction): Promise<string>;
  
  /**
   * Disconnect from the provider
   */
  disconnect(): Promise<void>;
}

/**
 * Events that the SDK can emit
 */
export enum SDKEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CHAIN_CHANGED = 'chainChanged',
  ACCOUNT_CHANGED = 'accountChanged',
  ERROR = 'error'
}

/**
 * Social login options interface
 */
export interface SocialLoginOptions {
  provider: SocialLoginProvider;
  clientId?: string;
  redirectUrl?: string;
}

/**
 * Auth provider options interface
 */
export interface AuthProviderOptions {
  socialLoginOptions?: SocialLoginOptions[];
} 