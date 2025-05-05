import { NetworkConfig } from '../types';
import { BitcoinProvider } from '../providers';
import { BaseChain } from './base';

export class BitcoinChain extends BaseChain {
  protected provider: BitcoinProvider;

  constructor(network: NetworkConfig, provider: BitcoinProvider) {
    super(network, provider);
    this.provider = provider;
  }

  async getUnspentOutputs(address: string): Promise<any[]> {
    return this.provider.getUnspentOutputs(address);
  }

  async estimateFee(blocks: number): Promise<number> {
    return this.provider.estimateFee(blocks);
  }

  async getTransaction(txid: string): Promise<any> {
    return this.provider.getTransaction(txid);
  }
} 