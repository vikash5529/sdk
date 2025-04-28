import { PluginConstructor, NetworkConfig, SDKProvider, ConnectionProvider, Transaction } from '../../types';

declare global {
  interface Window {
    tronWeb?: {
      defaultAddress: {
        base58: string;
      };
      trx: {
        getBalance: (address: string) => Promise<number>;
        sendTransaction: (to: string, amount: number) => Promise<any>;
      };
      toHex: (address: string) => string;
      sign: (message: string) => Promise<string>;
    };
  }
}

class TronLinkProvider implements SDKProvider {
  private network: NetworkConfig;
  private tronWeb!: NonNullable<Window['tronWeb']>;

  constructor(network: NetworkConfig) {
    this.network = network;
  }

  async init(_options?: unknown, _providerType?: ConnectionProvider): Promise<void> {
    if (typeof window === 'undefined' || !window.tronWeb) {
      throw new Error('TronLink not found');
    }
    this.tronWeb = window.tronWeb;
  }

  async getChainId(): Promise<string | number> {
    // Tron mainnet is 1, other networks have different IDs
    return this.network.id;
  }

  async getAccounts(): Promise<string[]> {
    if (!this.tronWeb.defaultAddress.base58) {
      throw new Error('No account connected');
    }
    return [this.tronWeb.defaultAddress.base58];
  }

  async getBalance(address?: string): Promise<string> {
    const accounts = await this.getAccounts();
    const targetAddress = address || accounts[0];
    const balance = await this.tronWeb.trx.getBalance(targetAddress);
    return balance.toString();
  }

  async signMessage(message: string): Promise<string> {
    return this.tronWeb.sign(message);
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    // Convert value from string to number (Tron uses TRX units directly)
    const amount = transaction.value ? parseInt(transaction.value) / 1_000_000 : 0;
    
    // Send the transaction
    const result = await this.tronWeb.trx.sendTransaction(
      transaction.to,
      amount
    );

    return result.txid;
  }

  async disconnect(): Promise<void> {
    // TronLink doesn't have a disconnect method
  }
}

export const TronLinkPlugin: PluginConstructor = {
  name: 'tronlink',
  chainType: 'tron',
  createProvider: (network: NetworkConfig) => new TronLinkProvider(network),
  isSupported: (network: NetworkConfig) => network.chainType === 'tron'
}; 