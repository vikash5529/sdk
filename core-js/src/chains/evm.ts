import { NetworkConfig } from '../types';
import { EVMProvider } from '../providers';
import { BaseChain } from './base';

export class EVMChain extends BaseChain {
  protected provider: EVMProvider;

  constructor(network: NetworkConfig, provider: EVMProvider) {
    super(network, provider);
    this.provider = provider;
  }

  async getGasPrice(): Promise<string> {
    return this.provider.getGasPrice();
  }

  async estimateGas(transaction: any): Promise<string> {
    return this.provider.estimateGas(transaction);
  }

  async getTransactionCount(address: string): Promise<number> {
    return this.provider.getTransactionCount(address);
  }
} 