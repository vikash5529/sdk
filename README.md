# Core JS SDK

A multi-chain wallet SDK supporting EVM, Bitcoin, Tron, and custom chains.

## Features

- Multi-chain support (EVM, Bitcoin, Tron)
- Custom chain integration
- TypeScript support
- React and Vue.js integrations
- Plugin system for extending functionality

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/core-js-sdk.git
cd core-js-sdk
```

2. Install dependencies:
```bash
npm install
```

## Project Structure

```
core-js-sdk/
├── core-js/              # Core SDK package
├── plugins/              # Chain-specific plugins
│   ├── bitcoin/         # Bitcoin plugin
│   ├── tron/           # Tron plugin
│   └── evm/            # EVM plugin
└── examples/            # Example applications
    └── react-wallet/   # React example
```

## Development

### Building the SDK

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=core-js
```

### Running Examples

```bash
# Start React example
npm run start:example
```

## Configuration

### SDK Configuration

```typescript
import { BlockchainSDK, SDKConfig } from '@core-js/sdk';

const config: SDKConfig = {
  projectId: "YOUR_PROJECT_ID",
  networks: [
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
    // Add more networks...
  ],
  metadata: {
    name: "Your App Name",
    description: "Your app description",
    url: "http://localhost:3000",
    icons: [],
  },
  plugins: [
    new BitcoinPlugin(),
    new TronPlugin(),
    // Add custom plugins...
  ],
};

const sdk = new BlockchainSDK(config);
```

### Custom Chain Integration

1. Create a custom chain plugin:

```typescript
import { PluginConstructor, NetworkConfig, SDKProvider } from "@core-js/sdk";

export class CustomChainPlugin implements PluginConstructor {
  name = 'custom_chain';
  chainType = 'custom_chain' as const;

  createProvider(network: NetworkConfig): SDKProvider {
    return {
      init: async () => {
        console.log(`Initializing custom chain: ${network.name}`);
      },
      getChainId: async () => network.id,
      getAccounts: async () => ['custom_chain_address'],
      getBalance: async () => '1000',
      signMessage: async (message: string) => message,
      sendTransaction: async () => 'custom_tx_hash',
      disconnect: async () => {},
      customMethod: async () => {
        return { customData: 'Custom chain specific data' };
      }
    };
  }

  isSupported(network: NetworkConfig): boolean {
    return network.chainType === this.chainType;
  }
}
```

2. Use the custom chain:

```typescript
// Add to SDK config
const config: SDKConfig = {
  // ... other config
  plugins: [
    new CustomChainPlugin()
  ],
  networks: [
    {
      id: "custom_1",
      name: "Custom Chain",
      chainType: "custom_chain",
      rpcUrl: "https://custom-chain-rpc.com",
    }
  ]
};

// Access custom chain
const customData = await sdk.custom_chain.customMethod();
```

## Usage Examples

### React Integration

```typescript
import { useSDK } from '@core-js/react';

function App() {
  const { sdk, connect, disconnect } = useSDK(config);

  const handleConnect = async () => {
    try {
      await connect(ConnectionProvider.INSTALLED_WALLET, 'evm');
      const balance = await sdk.getBalance();
      console.log('Balance:', balance);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <button onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
```

### Vue Integration

```typescript
import { useSDK } from '@core-js/vue';

export default {
  setup() {
    const { sdk, connect, disconnect } = useSDK(config);

    const handleConnect = async () => {
      try {
        await connect(ConnectionProvider.INSTALLED_WALLET, 'evm');
        const balance = await sdk.getBalance();
        console.log('Balance:', balance);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    };

    return {
      handleConnect
    };
  }
};
```

## API Reference

### Core SDK

- `BlockchainSDK`: Main SDK class
- `SDKConfig`: Configuration interface
- `NetworkConfig`: Network configuration interface
- `PluginConstructor`: Plugin interface
- `SDKProvider`: Provider interface

### Events

- `connected`: Emitted when wallet is connected
- `disconnected`: Emitted when wallet is disconnected
- `error`: Emitted on errors
- `network_changed`: Emitted when network changes
- `chain_added`: Emitted when custom chain is added
- `chain_removed`: Emitted when custom chain is removed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
