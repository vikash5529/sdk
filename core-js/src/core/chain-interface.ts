import { NetworkConfig, SDKProvider } from '../types';

export interface ChainInterface {
  getNetwork(): NetworkConfig;
  getProvider(): SDKProvider;
  getAccounts(): Promise<string[]>;
  getBalance(address?: string): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendTransaction(transaction: any): Promise<string>;
  disconnect(): Promise<void>;
  init(): Promise<void>;
  getChainId(): Promise<string | number>;
} 