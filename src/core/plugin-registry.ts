import { ChainAdapterPlugin, ChainAdapterPluginConstructor, PluginRegistryConfig } from '../types/plugin';
import { NetworkConfig } from '../types';

/**
 * PluginRegistry manages the registration and retrieval of chain adapter plugins
 */
export class PluginRegistry {
  private plugins: Map<string, ChainAdapterPlugin> = new Map();
  private config: PluginRegistryConfig;
  
  /**
   * Create a new plugin registry
   * @param config Configuration for the registry
   */
  constructor(config: PluginRegistryConfig = {}) {
    this.config = {
      allowOverrides: config.allowOverrides ?? false
    };
  }
  
  /**
   * Register a new chain adapter plugin
   * @param pluginConstructor Constructor function for the plugin
   * @throws Error if a plugin with the same ID is already registered and overrides are not allowed
   */
  registerPlugin(pluginConstructor: ChainAdapterPluginConstructor): void {
    const plugin = new pluginConstructor();
    
    if (this.plugins.has(plugin.id) && !this.config.allowOverrides) {
      throw new Error(`Plugin with ID "${plugin.id}" is already registered. Set allowOverrides to true to override.`);
    }
    
    this.plugins.set(plugin.id, plugin);
  }
  
  /**
   * Unregister a plugin by ID
   * @param pluginId ID of the plugin to unregister
   * @returns true if the plugin was found and unregistered, false otherwise
   */
  unregisterPlugin(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }
  
  /**
   * Get a plugin by ID
   * @param pluginId ID of the plugin to retrieve
   * @returns The plugin instance, or undefined if not found
   */
  getPlugin(pluginId: string): ChainAdapterPlugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  /**
   * Get all registered plugins
   * @returns Array of all registered plugin instances
   */
  getAllPlugins(): ChainAdapterPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Find a plugin that supports a given network
   * @param network Network configuration
   * @returns The first plugin that supports the network, or undefined if none found
   */
  findPluginForNetwork(network: NetworkConfig): ChainAdapterPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.supportsNetwork(network)) {
        return plugin;
      }
    }
    return undefined;
  }
  
  /**
   * Create a provider for a given network using the appropriate plugin
   * @param network Network configuration
   * @returns A provider instance for the network
   * @throws Error if no plugin supports the network
   */
  createProviderForNetwork(network: NetworkConfig) {
    const plugin = this.findPluginForNetwork(network);
    
    if (!plugin) {
      throw new Error(`No registered plugin supports network "${network.name}" (${network.chainType})`);
    }
    
    return plugin.createProvider(network);
  }
} 