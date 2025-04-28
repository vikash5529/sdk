import { ethers } from 'ethers';
import { ChainType, ConnectionProvider, NetworkConfig, SDKProvider, Transaction } from '../types';

/**
 * EVMAdapter class implements the SDKProvider interface for EVM chains
 */
export class EVMAdapter implements SDKProvider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private network: NetworkConfig;
  private providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET;

  /**
   * Constructor initializes the EVMAdapter with a network configuration
   * @param network The network configuration
   */
  constructor(network: NetworkConfig) {
    if (network.chainType !== ChainType.EVM) {
      throw new Error('Network must be an EVM chain');
    }
    this.network = network;
  }

  /**
   * Initialize the adapter with the provider
   * @param externalProvider External provider, if provided
   * @param providerType Type of connection provider
   */
  async init(
    externalProvider?: any,
    providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET
  ): Promise<void> {
    this.providerType = providerType;
    
    try {
      // Use external provider if provided, otherwise try to use window.ethereum
      if (externalProvider) {
        this.provider = new ethers.BrowserProvider(externalProvider);
      } else if (window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
      }
      
      // Get signer if available
      if (this.provider instanceof ethers.BrowserProvider) {
        this.signer = await this.provider.getSigner();
      }
    } catch (error) {
      console.error('Error initializing EVM adapter:', error);
      throw error;
    }
  }

  /**
   * Get the chain ID from the provider
   */
  async getChainId(): Promise<string | number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Get accounts from the provider
   */
  async getAccounts(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const accounts = await this.provider.listAccounts();
    return accounts.map(account => account.address);
  }

  /**
   * Get the balance of an address
   * @param address Optional address, uses the connected account if not provided
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    if (!address && this.signer) {
      address = await this.signer.getAddress();
    }
    
    if (!address) {
      throw new Error('No address provided and no connected account');
    }
    
    const balance = await this.provider.getBalance(address);
    return balance.toString();
  }

  /**
   * Sign a message with the connected account
   * @param message Message to sign
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    return await this.signer.signMessage(message);
  }

  /**
   * Send a transaction
   * @param transaction Transaction details
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    const tx = await this.signer.sendTransaction({
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
      data: transaction.data || '0x'
    });
    
    return tx.hash;
  }

  /**
   * Switch to a different network
   * @param networkId Network ID to switch to
   */
  async switchNetwork(networkId: string | number): Promise<void> {
    if (!this.provider || !window.ethereum) {
      throw new Error('Provider not initialized or not injected');
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(networkId).toString(16)}` }]
      });
    } catch (error: any) {
      // If the chain hasn't been added to the user's wallet
      if (error.code === 4902) {
        throw new Error('Chain not added to wallet. Please add the chain first.');
      }
      throw error;
    }
  }

  /**
   * Add a new network to the wallet
   * @param network Network configuration
   */
  async addNetwork(network: NetworkConfig): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }
    
    const params = {
      chainId: `0x${Number(network.id).toString(16)}`,
      chainName: network.name,
      nativeCurrency: network.nativeCurrency,
      rpcUrls: [network.rpcUrl],
      blockExplorerUrls: network.blockExplorerUrl ? [network.blockExplorerUrl] : undefined
    };
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }

  /**
   * Disconnect from the provider
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }
}

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 