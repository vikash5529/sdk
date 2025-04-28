import { BlockchainSDK, SDKConfig, NetworkConfig, BitcoinPlugin, TronPlugin } from "@core-js/sdk";

// Network configurations
const networks: NetworkConfig[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    chainType: "evm",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: "mainnet",
    name: "Bitcoin Mainnet",
    chainType: "bitcoin",
    rpcUrl: "https://blockstream.info/api/",
  },
  {
    id: "mainnet",
    name: "Tron Mainnet",
    chainType: "tron",
    rpcUrl: "https://api.trongrid.io",
  }
];

// SDK Configuration
const sdkConfig: SDKConfig = {
  projectId: "YOUR_PROJECT_ID",
  networks,
  metadata: {
    name: "Multi-Chain Balance Checker",
    description: "Example of checking balances across chains",
    url: "http://localhost:3000",
    icons: [],
  },
  plugins: [new BitcoinPlugin(), new TronPlugin()],
};

export class BalanceChecker {
  private sdk: BlockchainSDK;

  constructor() {
    this.sdk = new BlockchainSDK(sdkConfig);
  }

  async getBalanceForChain(chainType: string, address?: string): Promise<{ balance: string; chain: string }> {
    try {
      // Connect to the specific chain
      const connection = await this.sdk.connect(undefined, { plugin: chainType });
      
      // Get balance
      const balance = await this.sdk.getBalance(address || connection.address);
      
      return {
        balance,
        chain: chainType
      };
    } catch (error) {
      console.error(`Error getting balance for ${chainType}:`, error);
      return {
        balance: '0',
        chain: chainType
      };
    }
  }

  async getAllBalances(address?: string): Promise<Array<{ balance: string; chain: string }>> {
    const supportedChains = ['bitcoin', 'tron', 'evm'];
    const balances = await Promise.all(
      supportedChains.map(chain => this.getBalanceForChain(chain, address))
    );
    return balances;
  }
} 