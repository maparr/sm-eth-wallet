import { mapProviderError, shouldRetryError, formatErrorForDisplay } from './errors';
import { WalletError } from './types';
import { ERROR_TEST_CASES } from './__tests__/test-constants';

describe('WalletError', () => {
  test('creates error with exact properties', () => {
    const error = new WalletError('Transaction failed', 'TX_FAILED', 'nonce');
    
    expect(error.message).toBe('Transaction failed');
    expect(error.code).toBe('TX_FAILED');
    expect(error.field).toBe('nonce');
    expect(error.name).toBe('WalletError');
    expect(error).toBeInstanceOf(Error);
  });

  test('creates error without field', () => {
    const error = new WalletError('Network error', 'NETWORK_ERROR');
    
    expect(error.message).toBe('Network error');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.field).toBeUndefined();
  });
});

describe('mapProviderError', () => {
  test('maps exact RPC error codes to WalletErrors', () => {
    ERROR_TEST_CASES.rpcErrors.forEach(({ input, provider, expectedCode }) => {
      const error = mapProviderError(input, provider);
      expect(error).toBeInstanceOf(WalletError);
      expect(error.code).toBe(expectedCode);
    });

    // Test -32000 without message
    const errorWithoutMessage = mapProviderError({ code: -32000 }, 'TestProvider');
    expect(errorWithoutMessage.code).toBe('INVALID_TRANSACTION');
    expect(errorWithoutMessage.message).toBe('Invalid transaction: Unknown error');
  });

  test('maps network errors', () => {
    const networkError = new Error('fetch failed');
    const error = mapProviderError(networkError, 'TestProvider');
    
    expect(error.code).toBe('PROVIDER_ERROR');
    expect(error.message).toBe('fetch failed');
  });

  test('maps timeout errors', () => {
    const timeoutError = new Error('AbortError');
    const error = mapProviderError(timeoutError, 'TestProvider');
    
    expect(error.code).toBe('PROVIDER_ERROR');
    expect(error.message).toBe('AbortError');
  });

  test('handles unknown RPC errors', () => {
    const unknownError = { code: -99999, message: 'unknown error' };
    const error = mapProviderError(unknownError, 'TestProvider');
    
    expect(error.code).toBe('PROVIDER_ERROR');
    expect(error.message).toBe('unknown error');
  });

  test('handles non-Error objects', () => {
    const stringError = 'Something went wrong';
    const error = mapProviderError(stringError, 'TestProvider');
    
    expect(error.code).toBe('PROVIDER_ERROR');
    expect(error.message).toBe('Unknown provider error');
  });
});

describe('shouldRetryError', () => {
  test('returns true for retriable error codes', () => {
    ERROR_TEST_CASES.retriableErrors.forEach(code => {
      const error = new WalletError('Test error', code);
      expect(shouldRetryError(error)).toBe(true);
    });
  });

  test('returns false for non-retriable error codes', () => {
    ERROR_TEST_CASES.nonRetriableErrors.forEach(code => {
      const error = new WalletError('Test error', code);
      expect(shouldRetryError(error)).toBe(false);
    });
  });
});

describe('formatErrorForDisplay', () => {
  test('formats known errors with exact template', () => {
    const testCases = [
      {
        error: new WalletError('Test', 'INVALID_ADDRESS'),
        expected: 'Invalid Address: The Ethereum address format is incorrect.\nEnsure the address starts with 0x and contains 40 hexadecimal characters.'
      },
      {
        error: new WalletError('Test', 'GAS_LIMIT_TOO_LOW'),
        expected: 'Gas Limit Too Low: The gas limit is below the minimum required.\nSet gas limit to at least 21000.'
      },
      {
        error: new WalletError('Test', 'NETWORK_TIMEOUT'),
        expected: 'Network Timeout: The request timed out.\nCheck your internet connection and try again.'
      }
    ];

    testCases.forEach(({ error, expected }) => {
      const formatted = formatErrorForDisplay(error);
      expect(formatted).toBe(expected);
    });
  });

  test('formats unknown errors with generic message', () => {
    const error = new WalletError('Something unexpected', 'UNKNOWN_ERROR_CODE');
    const formatted = formatErrorForDisplay(error);
    
    expect(formatted).toBe('Error: Something unexpected');
  });

  test('handles all defined error codes', () => {
    // List of all error codes that should have templates
    const definedCodes = [
      'INVALID_MNEMONIC_LENGTH',
      'INVALID_MNEMONIC_WORDS',
      'INVALID_MNEMONIC_CHECKSUM',
      'INVALID_ADDRESS',
      'INVALID_VALUE',
      'GAS_LIMIT_TOO_LOW',
      'NETWORK_TIMEOUT',
      'ALL_PROVIDERS_FAILED'
    ];

    definedCodes.forEach(code => {
      const error = new WalletError('Test', code as any);
      const formatted = formatErrorForDisplay(error);
      
      // Should not return generic error for defined codes
      expect(formatted).not.toBe('Error: Test');
      expect(formatted).toContain(':'); // Has title
      expect(formatted).toContain('\n'); // Has action
    });
  });
});