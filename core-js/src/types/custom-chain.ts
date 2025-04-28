import { NetworkConfig, SDKProvider } from './index';

export interface CustomChainConfig extends NetworkConfig {
  // Additional custom chain specific configuration
  customRpcUrl?: string;
  customExplorerUrl?: string;
  customFeatures?: Record<string, any>;
}

export interface CustomChainProvider extends SDKProvider {
  // Additional custom chain specific methods
  customMethod?: () => Promise<any>;
}

export interface CustomChainPlugin {
  name: string;
  chainType: string;
  createProvider: (network: CustomChainConfig) => CustomChainProvider;
  isSupported: (network: NetworkConfig) => boolean;
} 