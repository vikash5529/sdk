import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import {
  ChainType,
  NetworkConfig,
  SDKProvider,
  SocialLoginOptions,
  SocialLoginProvider,
  Transaction
} from '../types';
import { ethers } from 'ethers';

/**
 * SocialLoginAdapter implements SDKProvider for social logins
 */
export class SocialLoginAdapter implements SDKProvider {
  private web3auth: Web3Auth | null = null;
  private provider: IProvider | null = null;
  private ethersProvider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private network: NetworkConfig;
  private socialLoginOptions: SocialLoginOptions[];

  /**
   * Constructor initializes the SocialLoginAdapter
   * @param network Network configuration for the chain
   * @param socialLoginOptions Options for social login providers
   */
  constructor(network: NetworkConfig, socialLoginOptions: SocialLoginOptions[]) {
    this.network = network;
    this.socialLoginOptions = socialLoginOptions;
  }

  /**
   * Initialize the Web3Auth provider
   */
  async init(clientId: string): Promise<void> {
    try {
      // Determine chain namespace based on chain type
      const chainNamespace = this.network.chainType === ChainType.EVM 
        ? CHAIN_NAMESPACES.EIP155 
        : CHAIN_NAMESPACES.SOLANA;
      
      // Create Web3Auth instance
      this.web3auth = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace,
          chainId: this.network.chainType === ChainType.EVM
            ? `0x${Number(this.network.id).toString(16)}`
            : this.network.id.toString(),
          rpcTarget: this.network.rpcUrl,
          displayName: this.network.name,
          blockExplorer: this.network.blockExplorerUrl,
          ticker: this.network.nativeCurrency?.symbol || "ETH",
          tickerName: this.network.nativeCurrency?.name || "Ethereum",
        },
        web3AuthNetwork: "sapphire_mainnet",
      });
      
      // Add OpenLogin adapter
      const openloginAdapter = new OpenloginAdapter({
        loginConfig: {
          // Enable specific login methods
          google: {
            name: "Google",
            verifier: "google",
            typeOfLogin: "google",
            clientId: this.getClientIdForProvider(SocialLoginProvider.GOOGLE),
          },
          twitter: this.getProviderConfig(SocialLoginProvider.TWITTER),
          github: this.getProviderConfig(SocialLoginProvider.GITHUB),
          discord: this.getProviderConfig(SocialLoginProvider.DISCORD),
          email_passwordless: this.getProviderConfig(SocialLoginProvider.EMAIL_PASSWORDLESS),
        },
      });
      
      this.web3auth.configureAdapter(openloginAdapter);
      
      // Initialize Web3Auth
      await this.web3auth.initModal();
      
      if (this.web3auth.provider) {
        this.provider = this.web3auth.provider;
        
        // Initialize ethers provider if chain type is EVM
        if (this.network.chainType === ChainType.EVM) {
          this.ethersProvider = new ethers.BrowserProvider(this.provider);
          this.signer = await this.ethersProvider.getSigner();
        }
      }
    } catch (error) {
      console.error("Error initializing Web3Auth:", error);
      throw error;
    }
  }

  /**
   * Get client ID for a specific provider from options
   */
  private getClientIdForProvider(provider: SocialLoginProvider): string {
    const option = this.socialLoginOptions.find(opt => opt.provider === provider);
    return option?.clientId || "";
  }

  /**
   * Get provider configuration for Web3Auth
   */
  private getProviderConfig(provider: SocialLoginProvider): any {
    const option = this.socialLoginOptions.find(opt => opt.provider === provider);
    if (!option) return undefined;
    
    return {
      name: this.capitalizeFirstLetter(provider),
      verifier: provider,
      typeOfLogin: provider,
      clientId: option.clientId || "",
    };
  }

  /**
   * Utility to capitalize first letter of string
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.replace('_', ' ').slice(1);
  }

  /**
   * Connect to the social login provider
   */
  async connect(): Promise<void> {
    if (!this.web3auth) {
      throw new Error("Web3Auth not initialized");
    }
    
    await this.web3auth.connect();
    
    // Reinitialize provider and signer
    if (this.web3auth.provider) {
      this.provider = this.web3auth.provider;
      
      if (this.network.chainType === ChainType.EVM) {
        this.ethersProvider = new ethers.BrowserProvider(this.provider);
        this.signer = await this.ethersProvider.getSigner();
      }
    }
  }

  /**
   * Get the chain ID
   */
  async getChainId(): Promise<string | number> {
    if (this.network.chainType === ChainType.EVM) {
      if (!this.ethersProvider) {
        throw new Error("EVM provider not initialized");
      }
      
      const network = await this.ethersProvider.getNetwork();
      return Number(network.chainId);
    }
    
    return this.network.id;
  }

  /**
   * Get the connected accounts
   */
  async getAccounts(): Promise<string[]> {
    if (this.network.chainType === ChainType.EVM) {
      if (!this.ethersProvider) {
        throw new Error("EVM provider not initialized");
      }
      
      const accounts = await this.ethersProvider.listAccounts();
      return accounts.map(account => account.address);
    } else {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      
      try {
        const accounts = await this.provider.request({ method: "getAccounts" });
        return accounts as string[];
      } catch (error) {
        console.error("Error getting accounts:", error);
        throw error;
      }
    }
  }

  /**
   * Get balance of an address
   */
  async getBalance(address?: string): Promise<string> {
    if (this.network.chainType === ChainType.EVM) {
      if (!this.ethersProvider) {
        throw new Error("EVM provider not initialized");
      }
      
      if (!address && this.signer) {
        address = await this.signer.getAddress();
      }
      
      if (!address) {
        throw new Error("No address provided and no connected account");
      }
      
      const balance = await this.ethersProvider.getBalance(address);
      return balance.toString();
    } else {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      
      if (!address) {
        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No connected account");
        }
        address = accounts[0];
      }
      
      try {
        const balance = await this.provider.request({
          method: "getBalance",
          params: [address]
        });
        return balance as string;
      } catch (error) {
        console.error("Error getting balance:", error);
        throw error;
      }
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (this.network.chainType === ChainType.EVM) {
      if (!this.signer) {
        throw new Error("Signer not initialized");
      }
      
      return await this.signer.signMessage(message);
    } else {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      
      try {
        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No connected account");
        }
        
        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);
        
        // For Solana, we need to sign the message bytes
        const signature = await this.provider.request({
          method: "signMessage",
          params: {
            message: messageBytes,
            display: "utf8",
          },
        });
        
        return signature as string;
      } catch (error) {
        console.error("Error signing message:", error);
        throw error;
      }
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    if (this.network.chainType === ChainType.EVM) {
      if (!this.signer) {
        throw new Error("Signer not initialized");
      }
      
      const tx = await this.signer.sendTransaction({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
        data: transaction.data || "0x",
      });
      
      return tx.hash;
    } else {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      
      try {
        // For Solana, we need to construct the transaction differently
        // This is a simplified version
        const txResponse = await this.provider.request({
          method: "sendTransaction",
          params: [
            {
              to: transaction.to,
              value: transaction.value || "0",
              data: transaction.data || "",
            },
          ],
        });
        
        return txResponse as string;
      } catch (error) {
        console.error("Error sending transaction:", error);
        throw error;
      }
    }
  }

  /**
   * Get the user info from Web3Auth
   */
  async getUserInfo(): Promise<any> {
    if (!this.web3auth) {
      throw new Error("Web3Auth not initialized");
    }
    
    return this.web3auth.getUserInfo();
  }

  /**
   * Disconnect from Web3Auth
   */
  async disconnect(): Promise<void> {
    if (!this.web3auth) {
      throw new Error("Web3Auth not initialized");
    }
    
    await this.web3auth.logout();
    this.provider = null;
    this.ethersProvider = null;
    this.signer = null;
  }
} 