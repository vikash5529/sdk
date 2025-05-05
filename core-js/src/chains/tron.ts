import { NetworkConfig, SDKProvider } from '../types';
import { ChainInterface } from '../core/chain-interface';

export class TronChain extends ChainInterface {
  constructor(network: NetworkConfig, provider: SDKProvider) {
    super(network, provider);
  }
  
  async getAccounts(): Promise<string[]> {
    return this.provider.getAccounts();
  }
  
  async getBalance(address?: string): Promise<string> {
    return this.provider.getBalance(address);
  }
  
  async signMessage(message: string): Promise<string> {
    return this.provider.signMessage(message);
  }
  
  async sendTransaction(transaction: any): Promise<string> {
    return this.provider.sendTransaction(transaction);
  }
  
  // Tron-specific methods
  async getAccountInfo(_address: string): Promise<any> {
    // Implementation
    return null;
  }
  
  async getBandwidth(): Promise<number> {
    // Implementation
    return 0;
  }
  
  async getEnergy(): Promise<number> {
    // Implementation
    return 0;
  }
} 