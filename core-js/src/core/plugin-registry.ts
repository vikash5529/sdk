import { PluginConstructor, NetworkConfig } from '../types';

export class PluginRegistry {
  private plugins: Map<string, PluginConstructor> = new Map();
  private allowOverrides: boolean;

  constructor(options: { allowOverrides: boolean }) {
    this.allowOverrides = options.allowOverrides;
  }

  registerPlugin(plugin: PluginConstructor): void {
    if (this.plugins.has(plugin.name) && !this.allowOverrides) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  getPluginByName(name: string): PluginConstructor | undefined {
    return this.plugins.get(name);
  }

  findPluginForNetwork(network: NetworkConfig): PluginConstructor | undefined {
    return Array.from(this.plugins.values()).find(plugin => 
      plugin.chainType === network.chainType && 
      plugin.isSupported(network)
    );
  }

  getPluginsByChainType(chainType: string): PluginConstructor[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.chainType === chainType);
  }
} 