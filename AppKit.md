# AppKit Architecture

This document provides an in-depth overview of the AppKit architecture, design patterns, and technical implementation.

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Core Components](#core-components)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Module Interactions](#module-interactions)
- [Technical Stack](#technical-stack)
- [Extension Points](#extension-points)
- [Optimization Strategies](#optimization-strategies)

## Architectural Overview

AppKit follows a modular monorepo architecture designed for extensibility and framework-agnosticism. The architecture employs a multi-layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  (React, Vue, Svelte, or plain HTML applications using AppKit) │
└───────────────────────────┬─────────────────────────────────┘
                           │
┌───────────────────────────▼─────────────────────────────────┐
│              FRAMEWORK INTEGRATION LAYER                     │
│        (React hooks, Vue composables, Web Components)        │
└───────────────────────────┬─────────────────────────────────┘
                           │
┌───────────────────────────▼─────────────────────────────────┐
│                      CORE LAYER                              │
│       (Client, Store, Authentication, Controllers)           │
└───────────────────────────┬─────────────────────────────────┘
                           │
┌───────────────────────────▼─────────────────────────────────┐
│                    ADAPTER LAYER                             │
│         (Blockchain-specific library adapters)               │
└───────────────────────────┬─────────────────────────────────┘
                           │
┌───────────────────────────▼─────────────────────────────────┐
│                  BLOCKCHAIN LAYER                            │
│           (Ethereum, Solana, Bitcoin, etc.)                  │
└─────────────────────────────────────────────────────────────┘
```

This separation of concerns allows AppKit to provide a consistent developer experience while supporting multiple blockchains and frontend frameworks.

## Core Components

### 1. Universal Adapter

The Universal Adapter is the heart of AppKit's blockchain-agnostic approach. It provides a consistent interface for interacting with different blockchain networks.

```typescript
// Simplified Universal Adapter interface
interface UniversalAdapter {
  connect(options?: ConnectOptions): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  switchNetwork(networkId: string): Promise<void>;
  signMessage(message: string): Promise<string>;
  sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
  // Other blockchain operations...
}
```

### 2. Store Management

AppKit uses a reactive state management system built with Valtio, providing a consistent state across all components.

```typescript
// Simplified store structure
interface AppKitState {
  connected: boolean;
  account: AccountInfo | null;
  chainId: string | null;
  adapter: UniversalAdapter | null;
  pendingTransactions: Transaction[];
  // Other state properties...
}
```

### 3. Client Layer

The Client layer coordinates operations between adapters, state management, and UI components.

```typescript
// Simplified Client interface
class AppKitClient {
  constructor(config: AppKitConfig);
  
  connect(): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  switchNetwork(chainId: string): Promise<void>;
  
  // Event handling
  on(event: AppKitEvent, callback: Function): () => void;
  off(event: AppKitEvent, callback: Function): void;
  
  // State management
  getState(): AppKitState;
  subscribe(callback: (state: AppKitState) => void): () => void;
}
```

### 4. UI Components

UI components are implemented as Web Components using Lit, providing framework-agnostic UI elements that can be used in any web application.

```typescript
// Example of a Web Component using Lit
@customElement('appkit-button')
export class AppKitButton extends LitElement {
  @property() public theme = 'light';
  @property() public disabled = false;
  
  static styles = css`/* Component styles */`;
  
  render() {
    return html`
      <button 
        class="appkit-button ${this.theme}" 
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
  
  private _handleClick() {
    // Connect wallet logic
  }
}
```

## Design Patterns

AppKit employs several key design patterns to achieve its flexibility and extensibility:

### 1. Adapter Pattern

The Adapter pattern is the foundation of AppKit's multi-chain support, allowing different blockchain libraries to be used through a common interface.

```typescript
// Example adapter implementation for wagmi
class WagmiAdapter implements UniversalAdapter {
  constructor(private config: WagmiConfig) {
    // Initialize wagmi client
  }
  
  async connect(): Promise<ConnectionResult> {
    // Wagmi-specific connect implementation
  }
  
  async disconnect(): Promise<void> {
    // Wagmi-specific disconnect implementation
  }
  
  // Other implemented methods...
}
```

### 2. Factory Pattern

Factory patterns are used to create instances of adapters, UI components, and other complex objects.

```typescript
// Factory function for creating AppKit instance
export function createAppKit(config: AppKitConfig): AppKitClient {
  // Initialize adapters
  const adapters = config.adapters.map(adapterConfig => 
    createAdapter(adapterConfig)
  );
  
  // Create client instance
  return new AppKitClient({ 
    adapters,
    theme: config.theme,
    projectId: config.projectId,
    // Other config...
  });
}
```

### 3. Observer Pattern

The Observer pattern is used for state management and event handling, allowing components to react to changes in the application state.

```typescript
// Simplified subscriber implementation
function createStore(initialState) {
  const store = proxy(initialState);
  const subscribers = new Set();
  
  function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }
  
  function setState(partial) {
    Object.assign(store, partial);
    notifySubscribers();
  }
  
  function notifySubscribers() {
    subscribers.forEach(callback => callback(snapshot(store)));
  }
  
  return { store, subscribe, setState };
}
```

### 4. Provider Pattern

The Provider pattern is used in framework integrations to make AppKit functionality available throughout component trees.

```typescript
// React provider example
export function AppKitProvider({ children, ...config }) {
  const appKitRef = useRef();
  
  if (!appKitRef.current) {
    appKitRef.current = createAppKit(config);
  }
  
  return (
    <AppKitContext.Provider value={appKitRef.current}>
      {children}
    </AppKitContext.Provider>
  );
}
```

### 5. Facade Pattern

The Facade pattern simplifies the complex subsystems of blockchain interactions through a unified API.

```typescript
// Simplified facade for complex blockchain operations
class TransactionFacade {
  constructor(private adapter: UniversalAdapter) {}
  
  async sendTokens(to: string, amount: string, tokenAddress?: string) {
    if (tokenAddress) {
      // ERC20 token transfer
      return this.sendERC20(to, amount, tokenAddress);
    } else {
      // Native token transfer
      return this.sendNative(to, amount);
    }
  }
  
  private async sendERC20(to: string, amount: string, tokenAddress: string) {
    // Complex ERC20 transfer implementation
  }
  
  private async sendNative(to: string, amount: string) {
    // Native token transfer implementation
  }
}
```

## Data Flow

AppKit implements a unidirectional data flow pattern:

1. **User Actions** trigger method calls on the AppKit client
2. **Client Methods** delegate to the appropriate adapter
3. **Adapters** interact with blockchain libraries
4. **State Updates** are propagated through the store
5. **UI Components** react to state changes and render accordingly

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │       │  AppKit  │       │ Blockchain│
│  Action  │──────▶│  Client  │──────▶│ Libraries │
└──────────┘       └──────────┘       └──────────┘
                        │                   │
                        │                   │
                        ▼                   ▼
                  ┌──────────┐       ┌──────────┐
                  │   Store  │◀──────│ Response │
                  │  Update  │       │   Data   │
                  └──────────┘       └──────────┘
                        │
                        │
                        ▼
                  ┌──────────┐
                  │    UI    │
                  │  Update  │
                  └──────────┘
```

This unidirectional flow ensures predictable state changes and easier debugging.

## Module Interactions

### Framework Integration Layer ↔ Core Layer

Framework-specific bindings (React hooks, Vue composables) interact with the core layer through:

1. **Direct method calls** on the AppKit client instance
2. **State subscriptions** for reactive updates
3. **Event listeners** for specific blockchain events

### Core Layer ↔ Adapter Layer

The core layer interacts with adapters through:

1. **Adapter interface methods** for blockchain operations
2. **Event propagation** from blockchain libraries to the core
3. **Network switching** coordination

### Adapter Layer ↔ Blockchain Layer

Adapters translate between AppKit's unified interface and blockchain-specific libraries by:

1. **Calling library methods** with transformed parameters
2. **Handling library-specific errors** and translating to AppKit errors
3. **Normalizing response data** to AppKit's standard formats

## Technical Stack

### Core Technologies

- **TypeScript**: For type safety and better developer experience
- **ESM**: Modern JavaScript module system
- **Web Components**: Framework-agnostic UI components
- **Lit**: Library for building Web Components

### State Management

- **Valtio**: Proxy-based state management with minimal boilerplate
- **Event Emitters**: For handling asynchronous events

### Build and Development

- **Turborepo**: Monorepo management and build optimization
- **pnpm**: Package management with efficient dependency handling
- **Vite**: Fast development server and bundling
- **TypeScript**: Strong typing system

### Testing

- **Vitest**: Unit and integration testing
- **Playwright**: End-to-end testing in browsers
- **Mock Service Worker**: API mocking for adapter testing

## Extension Points

AppKit provides several extension points for customization:

### 1. Custom Adapters

Developers can create custom adapters for new blockchain libraries or networks:

```typescript
class CustomAdapter implements UniversalAdapter {
  constructor(private customConfig: any) {
    // Initialize with custom configuration
  }
  
  // Implement all required methods of the UniversalAdapter interface
}

// Usage
const appKit = createAppKit({
  adapters: [new CustomAdapter(customConfig)],
  // ...other config
});
```

### 2. Custom UI Components

Custom UI components can be created by extending the base Web Components:

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('custom-wallet-button')
export class CustomWalletButton extends LitElement {
  @property() public customProp = '';
  
  // Custom component implementation
}
```

### 3. Custom Networks

AppKit supports adding custom networks through configuration:

```typescript
const customNetwork = {
  id: 'custom:1234',
  name: 'Custom Network',
  rpcUrl: 'https://custom.example.com',
  chainId: 1234,
  // Other network parameters
};

const appKit = createAppKit({
  networks: [mainnet, polygon, customNetwork],
  // ...other config
});
```

### 4. Middleware System

AppKit implements a middleware system that allows intercepting and modifying operations:

```typescript
// Logger middleware example
const loggerMiddleware = next => async action => {
  console.log('Before action:', action);
  const result = await next(action);
  console.log('After action:', action, 'Result:', result);
  return result;
};

appKit.use(loggerMiddleware);
```

## Optimization Strategies

AppKit implements several optimization strategies:

### 1. Code Splitting

The library is designed with code splitting in mind:

- Core functionality is separated from UI components
- Framework-specific code is isolated in separate entry points
- Adapters are loaded only when needed

### 2. Tree Shaking

The ESM architecture enables effective tree shaking, so unused code is not included in the final bundle.

### 3. Lazy Loading

Web Components and adapters can be lazy-loaded when needed, reducing initial loading time.

### 4. Caching

AppKit implements various caching strategies:

- Provider connections are cached
- Network configurations are cached
- RPC responses may be cached when appropriate

### 5. Batching

State updates are batched to minimize UI re-renders and improve performance.

---

This architectural overview provides a foundation for understanding how AppKit works internally. For more specific implementation details, refer to the source code and inline documentation. 