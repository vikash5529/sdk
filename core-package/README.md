# @sdk/core

Core SDK package for blockchain interactions. This package provides the core functionality for interacting with various blockchain networks, including EVM and Solana chains.

## Installation

```bash
npm install @sdk/core
```

## Usage

### Core SDK

```typescript
import { BlockchainSDK, NetworkConfig, ChainType } from '@sdk/core';

// Configure networks
const networks: NetworkConfig[] = [
  {
    id: '1',
    name: 'Ethereum Mainnet',
    chainType: ChainType.EVM,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
];

// Initialize SDK
const sdk = new BlockchainSDK({
  networks,
  metadata: {
    name: 'My DApp',
    description: 'My decentralized application',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  },
  projectId: 'YOUR-PROJECT-ID'
});

// Connect to a network
await sdk.connect(ConnectionProvider.INSTALLED_WALLET);
```

### React Hook

```tsx
import { useSDK } from '@sdk/core';

function MyComponent() {
  const {
    connectionInfo,
    isConnecting,
    error,
    connect,
    disconnect,
    getBalance,
    sendTransaction
  } = useSDK({
    networks: [
      {
        id: '1',
        name: 'Ethereum Mainnet',
        chainType: ChainType.EVM,
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
        blockExplorerUrl: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
      }
    ],
    metadata: {
      name: 'My DApp',
      description: 'My decentralized application',
      url: 'https://mydapp.com',
      icons: ['https://mydapp.com/icon.png']
    },
    projectId: 'YOUR-PROJECT-ID'
  });

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      {isConnecting && <div>Connecting...</div>}
      {connectionInfo ? (
        <div>
          <p>Connected to: {connectionInfo.address}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Vue Composable

```vue
<template>
  <div>
    <div v-if="error" class="error">{{ error.message }}</div>
    <div v-if="isConnecting">Connecting...</div>
    <div v-if="isConnected">
      <p>Connected to: {{ currentAddress }}</p>
      <button @click="disconnect">Disconnect</button>
    </div>
    <button v-else @click="connect">Connect Wallet</button>
  </div>
</template>

<script setup lang="ts">
import { useSDK } from '@sdk/core';

const {
  connectionInfo,
  isConnecting,
  error,
  isConnected,
  currentAddress,
  connect,
  disconnect,
  getBalance,
  sendTransaction
} = useSDK({
  networks: [
    {
      id: '1',
      name: 'Ethereum Mainnet',
      chainType: ChainType.EVM,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      blockExplorerUrl: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
  ],
  metadata: {
    name: 'My DApp',
    description: 'My decentralized application',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  },
  projectId: 'YOUR-PROJECT-ID'
});
</script>
```

## Features

- Support for multiple blockchain networks (EVM and Solana)
- Social login integration
- Transaction management
- Account management
- Balance queries
- Message signing
- React hooks integration
- Vue composables integration

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run typecheck

# Run tests
npm test
```

## License

MIT 