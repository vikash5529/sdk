import { EventEmitter } from 'events';
import { ChainInterface } from '../core/chain-interface';

export type ChainType = 'evm' | 'solana' | 'tron' | 'bitcoin' | string;

// Add dynamic chain property type
export type ChainProperties = {
  [key: string]: ChainInterface;
};

export interface NetworkConfig<T extends string = string> {
  id: string | number;
  name: string;
  chainType: T;
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

export interface PluginConstructor<T extends string = string> {
  name: string;
  chainType: T;
  createProvider: (network: NetworkConfig<T>) => SDKProvider;
  isSupported: (network: NetworkConfig<T>) => boolean;
}

export interface SDKConfig<T extends string = string> {
  projectId: string;
  networks: NetworkConfig<T>[];
  metadata: SDKMetadata;
  theme?: ThemeConfig;
  plugins?: PluginConstructor<T>[];
  provider: SDKProvider;
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
  init: (config?: any, providerType?: ConnectionProvider) => Promise<void>;
  getChainId: () => Promise<string | number>;
  getAccounts: () => Promise<string[]>;
  getBalance: (address?: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
  disconnect: () => Promise<void>;
  [key: string]: any; // Allow custom methods
}

// Custom chain types
export interface CustomChainConfig extends NetworkConfig {
  customRpcUrl?: string;
  customExplorerUrl?: string;
  customFeatures?: Record<string, any>;
}

export interface CustomChainProvider extends SDKProvider {
  customMethod?: () => Promise<any>;
}

export interface CustomChainPlugin {
  name: string;
  chainType: string;
  createProvider: (network: CustomChainConfig) => CustomChainProvider;
  isSupported: (network: NetworkConfig) => boolean;
}

export class BlockchainSDK extends EventEmitter {
  // Add dynamic chain properties
  [key: string]: any;
  // ... rest of the class definition ...
}

export interface ChainInterface extends SDKProvider {
  getNetwork(): NetworkConfig;
  getProvider(): SDKProvider;
} 