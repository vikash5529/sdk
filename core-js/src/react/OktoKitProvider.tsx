import React, { createContext, useContext, useMemo } from 'react';
import { BlockchainSDK, SDKConfig } from '../core/sdk';

interface OktoKitContextValue {
  sdk: BlockchainSDK;
}

const OktoKitContext = createContext<OktoKitContextValue | null>(null);

interface OktoKitProviderProps {
  config: SDKConfig;
  children: React.ReactNode;
}

export function OktoKitProvider({ config, children }: OktoKitProviderProps) {
  const sdk = useMemo(() => new BlockchainSDK(config), [config]);

  const value = useMemo(() => ({ sdk }), [sdk]);

  return (
    <OktoKitContext.Provider value={value}>
      {children}
    </OktoKitContext.Provider>
  );
}

export function useOktoKit() {
  const context = useContext(OktoKitContext);
  if (!context) {
    throw new Error('useOktoKit must be used within an OktoKitProvider');
  }
  return context;
} 