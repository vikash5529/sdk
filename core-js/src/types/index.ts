export type ChainType = 'evm' | 'solana' | 'tron' | 'bitcoin';

export interface NetworkConfig {
  id: number | string;
  name: string;
  chainType: ChainType;
  rpcUrl: string;
  blockExplorerUrl?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ConnectionInfo {
  address: string;
  chainId: string | number;
  chainType: ChainType;
  providerType: ConnectionProvider;
  isConnected: boolean;
}

export enum ConnectionProvider {
  INSTALLED_WALLET = 'installed_wallet',
  WALLET_CONNECT = 'wallet_connect',
  CUSTOM = 'custom'
}

export interface Transaction {
  to: string;
  value?: string;
  data?: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
}

export interface PluginConstructor {
  name: string;
  chainType: ChainType;
  createProvider: (network: NetworkConfig) => SDKProvider;
  isSupported: (network: NetworkConfig) => boolean;
}

export interface SDKConfig {
  networks: NetworkConfig[];
  metadata: SDKMetadata;
  projectId: string;
  theme?: ThemeConfig;
  plugins?: PluginConstructor[];
}

export interface SDKMetadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

export interface SDKProvider {
  init(options?: unknown, providerType?: ConnectionProvider): Promise<void>;
  getChainId(): Promise<string | number>;
  getAccounts(): Promise<string[]>;
  getBalance(address?: string): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendTransaction(transaction: Transaction): Promise<string>;
  disconnect(): Promise<void>;
} 