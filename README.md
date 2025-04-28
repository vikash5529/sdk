# Blockchain Connection SDK

A flexible, plugin-based SDK for connecting to different blockchain networks, including EVM chains and Solana. This SDK supports various connection methods including installed wallets, external wallets, and social logins.

## Features

- 🔌 **Plugin Architecture**: Easily extend the SDK to support new blockchains
- ⛓️ **Multi-Chain Support**: Built-in support for EVM chains and Solana
- 🔑 **Multiple Authentication Methods**: Connect via installed wallets, external wallets, or social logins
- 🔄 **Chain Switching**: Seamlessly switch between different blockchain networks
- 📚 **Consistent API**: Unified interface for interacting with any blockchain

## Installation

```bash
npm install blockchain-sdk
```

## Quick Start

```typescript
import { 
  BlockchainSDK, 
  ConnectionProvider, 
  ethereumMainnet 
} from 'blockchain-sdk';

// Initialize the SDK
const sdk = new BlockchainSDK({
  networks: [ethereumMainnet],
  metadata: {
    name: 'My dApp',
    description: 'My decentralized application',
    url: 'https://example.com',
    icons: ['https://example.com/icon.png']
  },
  projectId: 'your-project-id'
});

// Connect to an Ethereum wallet
async function connect() {
  try {
    const connection = await sdk.connect(ConnectionProvider.INSTALLED_WALLET);
    console.log('Connected to wallet:', connection);
    
    // Get the user's address
    const accounts = await sdk.getAccounts();
    console.log('User address:', accounts[0]);
    
    // Get the user's balance
    const balance = await sdk.getBalance();
    console.log('Balance:', sdk.formatBalance(balance));
    
    // Sign a message
    const signature = await sdk.signMessage('Hello, blockchain!');
    console.log('Signature:', signature);
    
    // Send a transaction
    const txHash = await sdk.sendTransaction({
      to: '0x1234567890123456789012345678901234567890',
      value: '0.01' // 0.01 ETH
    });
    console.log('Transaction hash:', txHash);
    
    // Disconnect
    await sdk.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

connect();
```

## Supporting New Blockchains

The SDK is designed to be easily extensible with new blockchain adapters through its plugin system. Here's how you can add support for a new blockchain:

### 1. Create a Custom Chain Adapter

```typescript
import { 
  ChainType, 
  ConnectionProvider, 
  NetworkConfig, 
  SDKProvider, 
  Transaction, 
  ChainAdapterPlugin 
} from 'blockchain-sdk';

// Define your custom chain type
enum CustomChainType {
  MY_CHAIN = 'my-chain'
}

// Implement the SDKProvider interface
class MyChainAdapter implements SDKProvider {
  private network: NetworkConfig;
  
  constructor(network: NetworkConfig) {
    this.network = network;
  }
  
  async init(options?: unknown, providerType?: ConnectionProvider): Promise<void> {
    // Initialize connection to your blockchain
  }
  
  async getChainId(): Promise<string | number> {
    // Return the chain ID
    return this.network.id;
  }
  
  async getAccounts(): Promise<string[]> {
    // Return connected accounts
    return ['your-chain-address'];
  }
  
  async getBalance(address?: string): Promise<string> {
    // Return the balance
    return '1000000000000000000';
  }
  
  async signMessage(message: string): Promise<string> {
    // Sign a message
    return 'signature';
  }
  
  async sendTransaction(transaction: Transaction): Promise<string> {
    // Send a transaction
    return 'tx-hash';
  }
  
  async disconnect(): Promise<void> {
    // Disconnect from the provider
  }
}

// Create a plugin for your custom chain
export class MyChainPlugin implements ChainAdapterPlugin {
  readonly id = 'my-chain-plugin';
  readonly name = 'My Custom Chain';
  readonly chainType = CustomChainType.MY_CHAIN;
  
  supportsNetwork(network: NetworkConfig): boolean {
    // Check if the network is supported by this plugin
    return network.chainType === this.chainType;
  }
  
  createProvider(network: NetworkConfig): SDKProvider {
    // Create a provider for the network
    return new MyChainAdapter(network);
  }
}

// Define a network configuration for your chain
export const myChainNetwork: NetworkConfig = {
  id: 'my-chain-1',
  name: 'My Chain Mainnet',
  chainType: CustomChainType.MY_CHAIN as unknown as ChainType,
  rpcUrl: 'https://rpc.my-chain.example',
  blockExplorerUrl: 'https://explorer.my-chain.example',
  nativeCurrency: {
    name: 'My Token',
    symbol: 'MYT',
    decimals: 18
  }
};
```

### 2. Register Your Plugin with the SDK

```typescript
import { BlockchainSDK } from 'blockchain-sdk';
import { MyChainPlugin, myChainNetwork } from './my-chain-plugin';

// Initialize the SDK with your custom network
const sdk = new BlockchainSDK({
  networks: [myChainNetwork],
  metadata: {
    name: 'My dApp',
    description: 'My decentralized application',
    url: 'https://example.com',
    icons: ['https://example.com/icon.png']
  },
  projectId: 'your-project-id'
}, {
  useDefaultPlugins: false // Don't load EVM and Solana plugins if you don't need them
});

// Register your custom chain plugin
sdk.registerPlugin(MyChainPlugin);

// Now you can connect to your custom chain
async function connectToMyChain() {
  try {
    const connection = await sdk.connect();
    console.log('Connected to my chain:', connection);
    
    // Use the SDK methods as usual
    // ...
    
    await sdk.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## API Reference

### BlockchainSDK

The main SDK class that manages blockchain interactions.

#### Constructor

```typescript
constructor(config: SDKConfig, options?: BlockchainSDKOptions)
```

- `config`: Configuration for the SDK
  - `networks`: Array of network configurations
  - `metadata`: Metadata about your application
  - `projectId`: Your project ID
  - `theme`: Optional theme configuration

- `options`: Additional options
  - `useDefaultPlugins`: Whether to register default plugins (EVM and Solana) (default: true)
  - `allowPluginOverrides`: Whether to allow overriding existing plugins (default: false)
  - `authOptions`: Authentication provider options

#### Methods

- `registerPlugin(pluginConstructor)`: Register a custom chain adapter plugin
- `getRegisteredPlugins()`: Get all registered plugins
- `getConnectionInfo()`: Get the current connection information
- `getNetworks()`: Get all supported networks
- `getCurrentNetwork()`: Get the current network
- `setCurrentNetwork(networkId)`: Set the current network
- `connect(providerType, options)`: Connect to a wallet or provider
- `disconnect()`: Disconnect the current wallet or provider
- `getAccounts()`: Get the connected accounts
- `getBalance(address?)`: Get the balance of an address
- `signMessage(message)`: Sign a message
- `sendTransaction(transaction)`: Send a transaction
- `formatBalance(balance, decimals?)`: Format a balance amount
- `getExplorerUrl(hashOrAddress, type?)`: Get an explorer URL

## License

MIT

# Web3 Social Login Adapter

A TypeScript implementation for Web3Auth social logins supporting both EVM and Solana chains.

## Features

- Multiple social login providers (Google, Twitter, GitHub, Discord, Email)
- Support for EVM and Solana chains
- Wallet operations (balance checking, transactions, message signing)
- User information retrieval
- TypeScript support

## Installation

```bash
npm install @web3auth/modal @web3auth/openlogin-adapter ethers
```

## Usage

### Basic Setup

```typescript
import { SocialLoginAdapter } from './auth/social-login-adapter';
import { ChainType, NetworkConfig, SocialLoginOptions, SocialLoginProvider } from './types';

// Configure your network
const network: NetworkConfig = {
  chainType: ChainType.EVM,
  id: 1, // Ethereum Mainnet
  name: "Ethereum",
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  blockExplorerUrl: "https://etherscan.io",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
};

// Configure social login options
const socialLoginOptions: SocialLoginOptions[] = [
  {
    provider: SocialLoginProvider.GOOGLE,
    clientId: "YOUR_GOOGLE_CLIENT_ID"
  },
  {
    provider: SocialLoginProvider.GITHUB,
    clientId: "YOUR_GITHUB_CLIENT_ID"
  }
];

// Initialize the adapter
const adapter = new SocialLoginAdapter(network, socialLoginOptions);
await adapter.init("YOUR_WEB3AUTH_CLIENT_ID");
```

### Connect and Perform Operations

```typescript
// Connect wallet
await adapter.connect();

// Get user's accounts
const accounts = await adapter.getAccounts();
console.log("Connected accounts:", accounts);

// Get account balance
const balance = await adapter.getBalance(accounts[0]);
console.log("Balance:", balance);

// Sign a message
const signature = await adapter.signMessage("Hello Web3!");
console.log("Signature:", signature);

// Send a transaction
const transaction = {
  to: "0x...",
  value: "0.1", // In ETH/SOL
  data: "0x" // Optional
};
const txHash = await adapter.sendTransaction(transaction);
console.log("Transaction hash:", txHash);

// Get user info
const userInfo = await adapter.getUserInfo();
console.log("User info:", userInfo);

// Disconnect
await adapter.disconnect();
```

### Error Handling

```typescript
try {
  await adapter.connect();
} catch (error) {
  console.error("Failed to connect:", error);
}
```

## Supported Social Login Providers

- Google (`SocialLoginProvider.GOOGLE`)
- Twitter (`SocialLoginProvider.TWITTER`)
- GitHub (`SocialLoginProvider.GITHUB`)
- Discord (`SocialLoginProvider.DISCORD`)
- Email Passwordless (`SocialLoginProvider.EMAIL_PASSWORDLESS`)

## Network Support

### EVM Networks
- Ethereum Mainnet
- Other EVM-compatible chains (Polygon, BSC, etc.)

### Solana Networks
- Solana Mainnet
- Solana Testnet

## Types

```typescript
enum ChainType {
  EVM = "evm",
  SOLANA = "solana"
}

interface NetworkConfig {
  chainType: ChainType;
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

interface SocialLoginOptions {
  provider: SocialLoginProvider;
  clientId: string;
}

interface Transaction {
  to: string;
  value?: string;
  data?: string;
}
```

## Security Considerations

- Store client IDs and sensitive configuration in environment variables
- Implement proper error handling
- Validate user input before sending transactions
- Keep dependencies updated

## License

MIT
