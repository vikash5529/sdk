import { 
  BlockchainSDK, 
  ConnectionProvider, 
  SocialLoginProvider,
  ethereumMainnet, 
  solanaMainnet 
} from '../index';
import { CustomChainPlugin, customChainNetwork } from './custom-chain-plugin';

/**
 * Example of using the SDK with default plugins (EVM and Solana)
 */
export async function BasicUsageExample() {
  // Initialize SDK with default plugins
  const sdk = new BlockchainSDK({
    networks: [ethereumMainnet, solanaMainnet],
    metadata: {
      name: 'My dApp',
      description: 'Example dApp',
      url: 'https://example.com',
      icons: ['https://example.com/icon.png']
    },
    projectId: 'your-project-id'
  });
  
  // Connect to Ethereum using installed wallet (e.g., MetaMask)
  try {
    const connection = await sdk.connect(ConnectionProvider.INSTALLED_WALLET);
    console.log('Connected to wallet:', connection);
    
    // Get accounts
    const accounts = await sdk.getAccounts();
    console.log('Accounts:', accounts);
    
    // Get balance
    const balance = await sdk.getBalance();
    console.log('Balance:', sdk.formatBalance(balance));
    
    // Sign a message
    const signature = await sdk.signMessage('Hello, blockchain!');
    console.log('Signature:', signature);
    
    // Send a transaction (assuming Ethereum)
    const txHash = await sdk.sendTransaction({
      to: '0x1234567890123456789012345678901234567890',
      value: '0.01' // 0.01 ETH
    });
    console.log('Transaction hash:', txHash);
    
    // Get explorer URL
    const explorerUrl = sdk.getExplorerUrl(txHash, 'transaction');
    console.log('View transaction:', explorerUrl);
    
    // Disconnect
    await sdk.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example of using the SDK with social login
 */
export async function socialLoginExample() {
  // Initialize SDK with auth options
  const sdk = new BlockchainSDK({
    networks: [ethereumMainnet],
    metadata: {
      name: 'My dApp',
      description: 'Example dApp with social login',
      url: 'https://example.com',
      icons: ['https://example.com/icon.png']
    },
    projectId: 'your-project-id'
  }, {
    authOptions: {
      socialLoginOptions: [
        {
          provider: SocialLoginProvider.GOOGLE,
          clientId: 'your-google-client-id'
        },
        {
          provider: SocialLoginProvider.TWITTER,
          clientId: 'your-twitter-client-id'
        }
      ]
    }
  });
  
  // Connect using social login
  try {
    const connection = await sdk.connect(ConnectionProvider.SOCIAL_LOGIN);
    console.log('Connected with social login:', connection);
    
    // Use SDK methods as with regular wallet connection...
    
    // Disconnect
    await sdk.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example of using the SDK with a custom chain plugin
 */
export async function customChainExample() {
  // Initialize SDK with no default plugins
  const sdk = new BlockchainSDK({
    networks: [customChainNetwork],
    metadata: {
      name: 'My Custom Chain dApp',
      description: 'Example dApp for custom chain',
      url: 'https://example.com',
      icons: ['https://example.com/icon.png']
    },
    projectId: 'your-project-id'
  }, {
    useDefaultPlugins: false // Don't load EVM and Solana plugins
  });
  
  // Register the custom chain plugin
  sdk.registerPlugin(CustomChainPlugin);
  
  // Connect to custom chain
  try {
    const connection = await sdk.connect();
    console.log('Connected to custom chain:', connection);
    
    // Use SDK methods with custom chain implementation...
    
    // Disconnect
    await sdk.disconnect();
    console.log('Disconnected from custom chain');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the examples
// basicUsageExample();
// socialLoginExample();
// customChainExample(); 