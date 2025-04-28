import { SolanaAdapter } from '../adapters/solana-adapter';
import { ChainType, NetworkConfig } from '../types';
import { ChainAdapterPlugin } from '../types/plugin';

/**
 * SolanaPlugin provides support for Solana chains
 */
export class SolanaPlugin implements ChainAdapterPlugin {
  /**
   * Unique identifier for the Solana plugin
   */
  readonly id = 'solana-plugin';
  
  /**
   * Display name for the Solana plugin
   */
  readonly name = 'Solana';
  
  /**
   * Chain type supported by this plugin
   */
  readonly chainType = ChainType.SOLANA;
  
  /**
   * Check if this plugin supports a given network
   * @param network Network configuration to check
   * @returns true if the network is a Solana chain
   */
  supportsNetwork(network: NetworkConfig): boolean {
    return network.chainType === ChainType.SOLANA;
  }
  
  /**
   * Create a new Solana provider for the given network
   * @param network Network configuration
   * @returns A Solana adapter instance
   */
  createProvider(network: NetworkConfig) {
    if (!this.supportsNetwork(network)) {
      throw new Error(`Network "${network.name}" is not a Solana chain`);
    }
    
    // For Solana adapters, we'll need to initialize it with a wallet
    // This just creates the adapter; the wallet will be passed later during initialization
    return new SolanaAdapter(network);
  }
} 