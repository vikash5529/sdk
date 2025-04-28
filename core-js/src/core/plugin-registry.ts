import { PluginConstructor } from '../types';

export interface PluginRegistryOptions {
  allowOverrides: boolean;
}

export class PluginRegistry<T extends string = string> {
  private plugins: Map<string, PluginConstructor<T>> = new Map();
  private options: PluginRegistryOptions;

  constructor(options: PluginRegistryOptions) {
    this.options = options;
  }

  registerPlugin(plugin: PluginConstructor<T>): void {
    if (!this.options.allowOverrides && this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  getPluginByName(name: string): PluginConstructor<T> | undefined {
    return this.plugins.get(name);
  }

  findPluginForNetwork(network: { chainType: T }): PluginConstructor<T> | undefined {
    return Array.from(this.plugins.values()).find(plugin => 
      plugin.isSupported(network as any)
    );
  }

  getPluginsByChainType(chainType: string): PluginConstructor<T>[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.chainType === chainType);
  }
} 