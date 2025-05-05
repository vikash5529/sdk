import { SDKProvider } from '../types';

export interface EVMProvider extends SDKProvider {
  // EVM specific provider methods
}

export interface SolanaProvider extends SDKProvider {
  // Solana specific provider methods
}

export interface BitcoinProvider extends SDKProvider {
  // Bitcoin specific provider methods
}

export interface TronProvider extends SDKProvider {
  // Tron specific provider methods
} 