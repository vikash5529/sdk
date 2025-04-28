import { EVMAdapter } from '../adapters/evm-adapter';
import { ChainType, NetworkConfig } from '../types';
import { ChainAdapterPlugin } from '../types/plugin';

/**
 * EVMPlugin provides support for Ethereum Virtual Machine compatible chains
 */
export class EVMPlugin implements ChainAdapterPlugin {
  /**
   * Unique identifier for the EVM plugin
   */
  readonly id = 'evm-plugin';
  
  /**
   * Display name for the EVM plugin
   */
  readonly name = 'Ethereum Virtual Machine';
  
  /**
   * Chain type supported by this plugin
   */
  readonly chainType = ChainType.EVM;
  
  /**
   * Check if this plugin supports a given network
   * @param network Network configuration to check
   * @returns true if the network is an EVM chain
   */
  supportsNetwork(network: NetworkConfig): boolean {
    return network.chainType === ChainType.EVM;
  }
  
  /**
   * Create a new EVM provider for the given network
   * @param network Network configuration
   * @returns An EVM adapter instance
   */
  createProvider(network: NetworkConfig) {
    if (!this.supportsNetwork(network)) {
      throw new Error(`Network "${network.name}" is not an EVM chain`);
    }
    
    return new EVMAdapter(network);
  }
} 