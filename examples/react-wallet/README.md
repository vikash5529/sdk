# Multi-Chain Wallet Example

This example demonstrates how to use the Core JS SDK to build a multi-chain wallet application supporting Ethereum, Solana, Tron, and Bitcoin networks.

## Features

- Connect to multiple wallets (MetaMask, Phantom, TronLink, Xverse)
- View balances across different chains
- Send transactions
- Real-time updates and error handling
- Clean, responsive UI with Tailwind CSS

## Prerequisites

- Node.js 16+
- npm or yarn
- Browser wallet extensions:
  - MetaMask for Ethereum
  - Phantom for Solana
  - TronLink for Tron
  - Xverse for Bitcoin

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update configuration:
   - Replace `YOUR_INFURA_KEY` in `src/App.tsx` with your Infura project ID
   - Replace `YOUR_PROJECT_ID` with your project ID

3. Start the development server:
```bash
npm start
```

## Usage

1. Click on any of the "Connect" buttons to connect your preferred wallet
2. Once connected, you can:
   - View your wallet address
   - Check your balance
   - Send transactions to other addresses

## Architecture

The example uses:
- React for UI
- Tailwind CSS for styling
- Core JS SDK for blockchain interactions
- Event-based state management
- Chain-specific unit conversions

## Important Notes

- Make sure you have the appropriate wallet extension installed for the chain you want to use
- Test transactions with small amounts first
- Keep your wallet's private keys secure
- This is a demo application - add additional security measures for production use 