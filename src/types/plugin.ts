import { ChainType, NetworkConfig, SDKProvider } from './index';

/**
 * Interface for chain adapter plugins
 * Any chain adapter must implement this interface to be registered with the SDK
 */
export interface ChainAdapterPlugin {
  /**
   * Unique identifier for the chain adapter
   */
  id: string;
  
  /**
   * Display name for the chain type
   */
  name: string;
  
  /**
   * Chain type supported by this adapter
   */
  chainType: ChainType | string;
  
  /**
   * Check if this plugin supports a given network
   * @param network Network configuration to check
   */
  supportsNetwork(network: NetworkConfig): boolean;
  
  /**
   * Create a new provider for the given network
   * @param network Network configuration
   */
  createProvider(network: NetworkConfig): SDKProvider;
}

/**
 * Type for constructor function of adapter plugins
 */
export type ChainAdapterPluginConstructor = new () => ChainAdapterPlugin;

/**
 * Registry configuration for chain adapter plugins
 */
export interface PluginRegistryConfig {
  /**
   * Whether to allow overriding existing plugins with the same ID
   */
  allowOverrides?: boolean;
} 