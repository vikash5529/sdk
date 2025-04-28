import { 
  Connection, 
  PublicKey, 
  Transaction as SolanaTransaction,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  ChainType, 
  ConnectionProvider, 
  NetworkConfig, 
  SDKProvider, 
  Transaction 
} from '../types';

/**
 * SolanaAdapter class implements the SDKProvider interface for Solana chains
 */
export class SolanaAdapter implements SDKProvider {
  private connection: Connection | null = null;
  private wallet: any = null;
  private network: NetworkConfig;
  private providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET;
  private publicKey: PublicKey | null = null;

  /**
   * Constructor initializes the SolanaAdapter with a network configuration
   * @param network The network configuration
   */
  constructor(network: NetworkConfig) {
    if (network.chainType !== ChainType.SOLANA) {
      throw new Error('Network must be a Solana chain');
    }
    this.network = network;
  }

  /**
   * Initialize the adapter with the wallet
   * @param wallet Solana wallet adapter
   * @param providerType Type of connection provider
   */
  async init(
    wallet: any,
    providerType: ConnectionProvider = ConnectionProvider.INSTALLED_WALLET
  ): Promise<void> {
    this.providerType = providerType;
    
    try {
      this.connection = new Connection(this.network.rpcUrl, 'confirmed');
      this.wallet = wallet;
      
      // Set the public key if available
      if (wallet && wallet.publicKey) {
        this.publicKey = wallet.publicKey;
      }
    } catch (error) {
      console.error('Error initializing Solana adapter:', error);
      throw error;
    }
  }

  /**
   * Get the chain ID (cluster name for Solana)
   */
  async getChainId(): Promise<string | number> {
    return this.network.id;
  }

  /**
   * Get accounts from the wallet
   */
  async getAccounts(): Promise<string[]> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    return [this.publicKey.toString()];
  }

  /**
   * Get the balance of an address
   * @param address Optional address, uses the connected account if not provided
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    
    const publicKey = address ? new PublicKey(address) : this.publicKey;
    
    if (!publicKey) {
      throw new Error('No address provided and no connected account');
    }
    
    const balance = await this.connection.getBalance(publicKey);
    return balance.toString();
  }

  /**
   * Sign a message with the connected account
   * @param message Message to sign
   */
  async signMessage(message: string): Promise<string> {
    if (!this.wallet || !this.wallet.signMessage) {
      throw new Error('Wallet does not support message signing');
    }
    
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Convert message to Uint8Array if it's a string
    const messageBytes = new TextEncoder().encode(message);
    
    // Sign the message
    const signature = await this.wallet.signMessage(messageBytes);
    
    // Return the signature as a string
    return Buffer.from(signature).toString('hex');
  }

  /**
   * Send a transaction
   * @param transaction Transaction details
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.connection || !this.wallet || !this.publicKey) {
      throw new Error('Wallet not connected or initialized');
    }
    
    // Create a Solana transaction
    const solanaTransaction = new SolanaTransaction();
    
    // Parse SOL amount if provided
    const amount = transaction.value 
      ? parseFloat(transaction.value) * LAMPORTS_PER_SOL 
      : 0;
    
    // Add a transfer instruction if value is provided
    if (amount > 0 && transaction.to) {
      const toPublicKey = new PublicKey(transaction.to);
      
      solanaTransaction.add(
        SystemProgram.transfer({
          fromPubkey: this.publicKey,
          toPubkey: toPublicKey,
          lamports: amount
        })
      );
    }
    
    // Get the recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    solanaTransaction.recentBlockhash = blockhash;
    solanaTransaction.feePayer = this.publicKey;
    
    // Sign the transaction
    const signedTransaction = await this.wallet.signTransaction(solanaTransaction);
    
    // Send the transaction
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    
    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    if (this.wallet && this.wallet.disconnect) {
      await this.wallet.disconnect();
    }
    
    this.wallet = null;
    this.publicKey = null;
  }
} 