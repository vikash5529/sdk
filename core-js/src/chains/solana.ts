import { NetworkConfig } from '../types';
import { SolanaProvider } from '../providers';
import { BaseChain } from './base';

export class SolanaChain extends BaseChain {
  protected provider: SolanaProvider;

  constructor(network: NetworkConfig, provider: SolanaProvider) {
    super(network, provider);
    this.provider = provider;
  }

  async getRecentBlockhash(): Promise<string> {
    return this.provider.getRecentBlockhash();
  }

  async getTokenAccounts(address: string): Promise<string[]> {
    return this.provider.getTokenAccounts(address);
  }
} 