import { PluginConstructor, NetworkConfig, SDKProvider, ConnectionProvider, Transaction } from '../../types';

declare global {
  interface Window {
    ethereum?: {
      chainId: string;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

class MetaMaskProvider implements SDKProvider {
  private network: NetworkConfig;
  private ethereum!: NonNullable<Window['ethereum']>;

  constructor(network: NetworkConfig) {
    this.network = network;
  }

  async init(_options?: unknown, _providerType?: ConnectionProvider): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found');
    }
    this.ethereum = window.ethereum;
  }

  async getChainId(): Promise<string | number> {
    return this.ethereum.chainId;
  }

  async getAccounts(): Promise<string[]> {
    return this.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async getBalance(address?: string): Promise<string> {
    const accounts = await this.getAccounts();
    const targetAddress = address || accounts[0];
    return this.ethereum.request({
      method: 'eth_getBalance',
      params: [targetAddress, 'latest']
    });
  }

  async signMessage(message: string): Promise<string> {
    const accounts = await this.getAccounts();
    return this.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    const accounts = await this.getAccounts();
    return this.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        ...transaction,
        from: accounts[0]
      }]
    });
  }

  async disconnect(): Promise<void> {
    // MetaMask doesn't have a disconnect method
  }
}

export const MetaMaskPlugin: PluginConstructor = {
  name: 'metamask',
  chainType: 'evm',
  createProvider: (network: NetworkConfig) => new MetaMaskProvider(network),
  isSupported: (network: NetworkConfig) => network.chainType === 'evm'
}; 