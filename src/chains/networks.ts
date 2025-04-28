import { ChainType, NetworkConfig } from '../types';

// EVM Chain configurations
export const ethereumMainnet: NetworkConfig = {
  id: 1,
  name: 'Ethereum Mainnet',
  chainType: ChainType.EVM,
  rpcUrl: 'https://ethereum.publicnode.com',
  blockExplorerUrl: 'https://etherscan.io',
  iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  }
};

export const polygonMainnet: NetworkConfig = {
  id: 137,
  name: 'Polygon Mainnet',
  chainType: ChainType.EVM,
  rpcUrl: 'https://polygon-rpc.com',
  blockExplorerUrl: 'https://polygonscan.com',
  iconUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

export const arbitrumOne: NetworkConfig = {
  id: 42161,
  name: 'Arbitrum One',
  chainType: ChainType.EVM,
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  blockExplorerUrl: 'https://arbiscan.io',
  iconUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

export const optimismMainnet: NetworkConfig = {
  id: 10,
  name: 'Optimism',
  chainType: ChainType.EVM,
  rpcUrl: 'https://mainnet.optimism.io',
  blockExplorerUrl: 'https://optimistic.etherscan.io',
  iconUrl: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

export const baseMainnet: NetworkConfig = {
  id: 8453,
  name: 'Base',
  chainType: ChainType.EVM,
  rpcUrl: 'https://mainnet.base.org',
  blockExplorerUrl: 'https://basescan.org',
  iconUrl: 'https://cryptologos.cc/logos/base-logo.png',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

// Solana Chain configurations
export const solanaMainnet: NetworkConfig = {
  id: 'mainnet-beta',
  name: 'Solana Mainnet',
  chainType: ChainType.SOLANA,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  blockExplorerUrl: 'https://explorer.solana.com',
  iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9
  }
};

export const solanaDevnet: NetworkConfig = {
  id: 'devnet',
  name: 'Solana Devnet',
  chainType: ChainType.SOLANA,
  rpcUrl: 'https://api.devnet.solana.com',
  blockExplorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9
  }
};

// List of all supported EVM networks
export const evmNetworks: NetworkConfig[] = [
  ethereumMainnet,
  polygonMainnet,
  arbitrumOne,
  optimismMainnet,
  baseMainnet
];

// List of all supported Solana networks
export const solanaNetworks: NetworkConfig[] = [
  solanaMainnet,
  solanaDevnet
];

// List of all supported networks
export const allNetworks: NetworkConfig[] = [
  ...evmNetworks,
  ...solanaNetworks
]; 