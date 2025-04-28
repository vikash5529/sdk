import { PluginConstructor, NetworkConfig, SDKProvider, ConnectionProvider, Transaction } from '../../types';

declare global {
  interface Window {
    xverse?: {
      bitcoin: {
        connect: () => Promise<{ addresses: Array<{ address: string }> }>;
        disconnect: () => Promise<void>;
        getBalance: (address: string) => Promise<{ confirmed: number; unconfirmed: number }>;
        signMessage: (address: string, message: string) => Promise<{ signature: string }>;
        sendBitcoin: (params: {
          address: string;
          amount: number;
          network: 'Mainnet' | 'Testnet';
        }) => Promise<{ txId: string }>;
      };
    };
  }
}

class XverseProvider implements SDKProvider {
  private network: NetworkConfig;
  private xverse!: NonNullable<Window['xverse']>;
  private connectedAddress: string | null = null;

  constructor(network: NetworkConfig) {
    this.network = network;
  }

  async init(_options?: unknown, _providerType?: ConnectionProvider): Promise<void> {
    if (typeof window === 'undefined' || !window.xverse) {
      throw new Error('Xverse wallet not found');
    }
    this.xverse = window.xverse;
  }

  async getChainId(): Promise<string | number> {
    // Bitcoin mainnet is 1, testnet is 2
    return this.network.id;
  }

  async getAccounts(): Promise<string[]> {
    if (this.connectedAddress) {
      return [this.connectedAddress];
    }

    const response = await this.xverse.bitcoin.connect();
    if (!response.addresses.length) {
      throw new Error('No Bitcoin addresses available');
    }

    this.connectedAddress = response.addresses[0].address;
    return [this.connectedAddress];
  }

  async getBalance(address?: string): Promise<string> {
    const accounts = await this.getAccounts();
    const targetAddress = address || accounts[0];
    
    const balance = await this.xverse.bitcoin.getBalance(targetAddress);
    // Return total balance in satoshis
    return (balance.confirmed + balance.unconfirmed).toString();
  }

  async signMessage(message: string): Promise<string> {
    const accounts = await this.getAccounts();
    const response = await this.xverse.bitcoin.signMessage(accounts[0], message);
    return response.signature;
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    // Convert value from string (satoshis) to BTC
    const amount = transaction.value ? parseInt(transaction.value) / 100_000_000 : 0;
    
    const response = await this.xverse.bitcoin.sendBitcoin({
      address: transaction.to,
      amount,
      network: this.network.id === 1 ? 'Mainnet' : 'Testnet'
    });

    return response.txId;
  }

  async disconnect(): Promise<void> {
    await this.xverse.bitcoin.disconnect();
    this.connectedAddress = null;
  }
}

export const XversePlugin: PluginConstructor = {
  name: 'xverse',
  chainType: 'bitcoin',
  createProvider: (network: NetworkConfig) => new XverseProvider(network),
  isSupported: (network: NetworkConfig) => network.chainType === 'bitcoin'
}; 