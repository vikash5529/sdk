# Core JS SDK

A type-safe blockchain SDK with plugin architecture supporting multiple chains and wallets.

## Features

- Type-safe implementation
- Plugin-based architecture
- Support for multiple chains (EVM, Solana)
- Support for multiple wallets (MetaMask, Phantom)
- Event-based communication
- Clean separation of concerns

## Installation

```bash
npm install @core-js/sdk
```

## Usage

### Basic Setup

```typescript
import { BlockchainSDK, MetaMaskPlugin, PhantomPlugin } from '@core-js/sdk';

const sdk = new BlockchainSDK({
  networks: [
    {
      id: 1,
      name: 'Ethereum Mainnet',
      chainType: 'evm',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorerUrl: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    {
      id: 'mainnet-beta',
      name: 'Solana Mainnet',
      chainType: 'solana',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      blockExplorerUrl: 'https://explorer.solana.com',
      nativeCurrency: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
      }
    }
  ],
  metadata: {
    name: 'My DApp',
    description: 'A decentralized application',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  },
  projectId: 'YOUR_PROJECT_ID',
  plugins: [MetaMaskPlugin, PhantomPlugin]
});
```

### Connecting to a Wallet

```typescript
// Connect with MetaMask
await sdk.connect(ConnectionProvider.INSTALLED_WALLET, { plugin: 'metamask' });

// Connect with Phantom
await sdk.connect(ConnectionProvider.INSTALLED_WALLET, { plugin: 'phantom' });
```

### Sending Transactions

```typescript
// Send a transaction
const txHash = await sdk.sendTransaction({
  to: '0x...',
  value: '1000000000000000000', // 1 ETH in wei
  data: '0x'
});
```

### Event Handling

```typescript
sdk.on(SDKEvents.CONNECTED, (info) => {
  console.log('Connected:', info);
});

sdk.on(SDKEvents.DISCONNECTED, () => {
  console.log('Disconnected');
});

sdk.on(SDKEvents.ERROR, (error) => {
  console.error('Error:', error);
});
```

## Creating Custom Plugins

To create a custom plugin, implement the `PluginConstructor` interface:

```typescript
import { PluginConstructor, NetworkConfig, SDKProvider } from '@core-js/sdk';

class CustomProvider implements SDKProvider {
  // Implement required methods
}

export const CustomPlugin: PluginConstructor = {
  name: 'custom-plugin',
  chainType: 'evm', // or 'solana'
  createProvider: (network: NetworkConfig) => new CustomProvider(network),
  isSupported: (network: NetworkConfig) => network.chainType === 'evm'
};
```

## License

MIT 