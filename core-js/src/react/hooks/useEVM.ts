import { useCallback } from 'react';
import { useChain } from './useChain';
import { ChainType } from '../../types';

interface EVMState {
  gasPrice?: string;
  transactionCount?: number;
}

export function useEVM() {
  const chain = useChain('evm' as ChainType);
  const [state, setState] = useState<EVMState>({});

  const getGasPrice = useCallback(async () => {
    try {
      const gasPrice = await chain.sdk.evm.getGasPrice();
      setState(prev => ({
        ...prev,
        gasPrice
      }));
      return gasPrice;
    } catch (error) {
      chain.setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get gas price'
      }));
      throw error;
    }
  }, [chain]);

  const getTransactionCount = useCallback(async (address: string) => {
    try {
      const count = await chain.sdk.evm.getTransactionCount(address);
      setState(prev => ({
        ...prev,
        transactionCount: count
      }));
      return count;
    } catch (error) {
      chain.setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get transaction count'
      }));
      throw error;
    }
  }, [chain]);

  const estimateGas = useCallback(async (transaction: any) => {
    try {
      return await chain.sdk.evm.estimateGas(transaction);
    } catch (error) {
      chain.setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to estimate gas'
      }));
      throw error;
    }
  }, [chain]);

  return {
    ...chain,
    ...state,
    getGasPrice,
    getTransactionCount,
    estimateGas
  };
} 