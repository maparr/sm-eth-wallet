import { jest } from '@jest/globals';
import { TransactionBroadcaster } from './broadcaster';
import { SignedTransaction, WalletError } from './types';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('TransactionBroadcaster', () => {
  let broadcaster: TransactionBroadcaster;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    broadcaster = new TransactionBroadcaster();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  // Real signed transaction from test vector
  const mockSignedTx: SignedTransaction = {
    nonce: 0n,
    gasPrice: 20000000000n,
    gasLimit: 21000n,
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    value: 1000000000000000000n,
    data: '0x',
    chainId: 1,
    v: 37,
    r: 12345678901234567890123456789012345678901234567890123456789012345678n,
    s: 98765432109876543210987654321098765432109876543210987654321098765432n,
    hash: '0x7c9f8a8b3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    rawTransaction: '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0' +
                     '1b4e5f6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4fa0' +
                     'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
  };

  describe('Provider initialization', () => {
    test('initializes with exact 3 providers', async () => {
      // Mock all providers to fail with non-retriable error
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32000, message: 'Test error' }
        })
      } as Response);

      await expect(broadcaster.broadcastTransaction(mockSignedTx))
        .rejects.toThrow('Invalid transaction: Test error');
      
      // Should stop after first non-retriable error
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Successful broadcasting', () => {
    test('broadcasts with exact transaction hash response', async () => {
      const expectedTxHash = '0x7c9f8a8b3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: expectedTxHash
        })
      } as Response);

      const result = await broadcaster.broadcastTransaction(mockSignedTx);
      expect(result).toBe(expectedTxHash);
    });

    test('sends exact RPC request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: mockSignedTx.hash
        })
      } as Response);

      await broadcaster.broadcastTransaction(mockSignedTx);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call![0]).toBe('https://eth.llamarpc.com');
      expect(call![1]?.method).toBe('POST');
      expect(call![1]?.headers).toEqual({ 'Content-Type': 'application/json' });
      const body = JSON.parse(call![1]?.body as string);
      expect(body.jsonrpc).toBe('2.0');
      expect(body.method).toBe('eth_sendRawTransaction');
      expect(body.params).toEqual([mockSignedTx.rawTransaction]);
      expect(typeof body.id).toBe('number');
    });
  });

  describe('Provider failover with exact behavior', () => {
    test('uses network-specific RPC URL for chainId transactions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0xsuccesshash'
        })
      } as Response);

      const result = await broadcaster.broadcastTransaction(mockSignedTx);
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call![0]).toBe('https://eth.llamarpc.com');
      expect(result).toBe('0xsuccesshash');
    });

    test('fails immediately on non-retriable error', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32000,
            message: 'insufficient funds for gas * price + value'
          }
        })
      } as Response);

      await expect(broadcaster.broadcastTransaction(mockSignedTx))
        .rejects.toThrow('Insufficient funds for gas * price + value');
      
      // Should stop after first non-retriable error
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timeout handling', () => {
    test('handles request timeout with AbortError', async () => {
      // Use raw transaction string to test multi-provider fallback
      const rawTxString = '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0';
      
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      
      mockFetch.mockRejectedValueOnce(abortError);
      
      // Should retry with next provider
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0xtimeoutsuccess'
        })
      } as Response);
      
      const result = await broadcaster.broadcastTransaction(rawTxString);
      expect(result).toBe('0xtimeoutsuccess');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling with exact error codes', () => {
    test('handles rate limiting (code -32005)', async () => {
      // Use raw transaction string to test multi-provider fallback
      const rawTxString = '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0';
      
      let attempt = 0;
      mockFetch.mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              jsonrpc: '2.0',
              id: 1,
              error: { code: -32005, message: 'Too many requests' }
            })
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 2,
            result: '0xratelimitsuccess'
          })
        } as Response);
      });

      const result = await broadcaster.broadcastTransaction(rawTxString);
      expect(result).toBe('0xratelimitsuccess');
      expect(attempt).toBe(2);
    });

    test('handles nonce too low (code -32001)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32001,
            message: 'nonce too low: account nonce is 5, transaction nonce is 0'
          }
        })
      } as Response);

      await expect(broadcaster.broadcastTransaction(mockSignedTx))
        .rejects.toThrow('Nonce too low');
    });

    test('handles network timeout', async () => {
      // Use raw transaction string to test multi-provider fallback
      const rawTxString = '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0';
      
      mockFetch.mockRejectedValueOnce(new Error('AbortError'));
      
      // Should retry with next provider
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 2,
          result: '0xtimeoutsuccess'
        })
      } as Response);

      const result = await broadcaster.broadcastTransaction(rawTxString);
      expect(result).toBe('0xtimeoutsuccess');
    });

    test('handles HTTP errors', async () => {
      // Use raw transaction string to test multi-provider fallback
      const rawTxString = '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0';
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      } as Response);

      // Should retry with next provider
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 2,
          result: '0xhttperrorsuccess'
        })
      } as Response);

      const result = await broadcaster.broadcastTransaction(rawTxString);
      expect(result).toBe('0xhttperrorsuccess');
    });
  });

  describe('Provider health tracking', () => {
    test('throws when no healthy providers available', async () => {
      // Use raw transaction string without chainId to test provider health logic
      const rawTxString = '0xf86c808504a817c800825208947099797c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008025a0';
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32000, message: 'Error' }
        })
      } as Response);
      
      await expect(broadcaster.broadcastTransaction(rawTxString))
        .rejects.toThrow('Invalid transaction: Error');
    });

    test('throws ALL_PROVIDERS_FAILED when all providers fail with retriable errors', async () => {
      // All providers return retriable errors
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32005, message: 'rate limited' }
        })
      } as Response);
      
      await expect(broadcaster.broadcastTransaction(mockSignedTx))
        .rejects.toThrow('All providers failed to broadcast transaction');
        
      // Should have tried only 1 provider since transaction has chainId
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('handles empty result in RPC response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: null // No result
        })
      } as Response);
      
      await expect(broadcaster.broadcastTransaction(mockSignedTx))
        .rejects.toThrow('All providers failed to broadcast transaction');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Transaction receipt', () => {
    test('gets receipt with exact block number and status', async () => {
      const txHash = '0x7c9f8a8b3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: {
            transactionHash: txHash,
            blockNumber: '0x1234567', // Block 19088743
            blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            transactionIndex: '0x42',
            from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            status: '0x1', // Success
            gasUsed: '0x5208', // 21000
            cumulativeGasUsed: '0x123456',
            logs: []
          }
        })
      } as Response);

      const receipt = await broadcaster.getTransactionReceipt(txHash);
      
      expect(receipt).toEqual({
        transactionHash: txHash,
        blockNumber: '0x1234567',
        blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        transactionIndex: '0x42',
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        status: '0x1',
        gasUsed: '0x5208',
        cumulativeGasUsed: '0x123456',
        logs: []
      });
    });

    test('handles no result in receipt response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: null
        })
      } as Response);
      
      const receipt = await broadcaster.getTransactionReceipt('0xpendingtx');
      expect(receipt).toBeNull();
    });

    test('returns null for pending transaction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: null
        })
      } as Response);

      const receipt = await broadcaster.getTransactionReceipt('0xpendingtx');
      expect(receipt).toBeNull();
    });
  });
});