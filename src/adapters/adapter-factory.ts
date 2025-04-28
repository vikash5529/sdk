import { ChainType, NetworkConfig, SDKProvider } from '../types';
import { EVMAdapter } from './evm-adapter';
import { SolanaAdapter } from './solana-adapter';

/**
 * AdapterFactory class for creating chain-specific adapters
 */
export class AdapterFactory {
  /**
   * Create a new chain adapter based on the network configuration
   * @param network Network configuration
   * @returns A chain-specific adapter instance
   */
  static createAdapter(network: NetworkConfig): SDKProvider {
    switch (network.chainType) {
      case ChainType.EVM:
        return new EVMAdapter(network);
        
      case ChainType.SOLANA:
        return new SolanaAdapter(network);
        
      default:
        throw new Error(`Unsupported chain type: ${network.chainType}`);
    }
  }
} 