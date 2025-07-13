import { InputValidator } from './validation';
import { WalletError } from './types';
import { VALIDATION_TEST_CASES } from './__tests__/test-constants';

describe('InputValidator', () => {
  describe('Address validation with exact values', () => {
    test('validates and returns exact checksummed addresses', () => {
      VALIDATION_TEST_CASES.addresses.valid.forEach(({ input, expected }) => {
        const result = InputValidator.validateAddress(input);
        expect(result).toBe(expected);
      });
    });

    test('accepts correctly checksummed addresses', () => {
      const checksummed = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
      const result = InputValidator.validateAddress(checksummed);
      expect(result).toBe(checksummed);
    });

    test('rejects incorrectly checksummed addresses', () => {
      // Wrong checksum (should be E not e in BeAed)
      const wrongChecksum = '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1Beaed';
      expect(() => InputValidator.validateAddress(wrongChecksum))
        .toThrow('Invalid address checksum');
    });

    test('rejects invalid address formats', () => {
      VALIDATION_TEST_CASES.addresses.invalid.forEach(addr => {
        expect(() => InputValidator.validateAddress(addr))
          .toThrow(); // Either format error or checksum error
      });
    });
  });

  describe('Wei amount validation with exact values', () => {
    test('converts ETH to exact Wei values', () => {
      VALIDATION_TEST_CASES.amounts.valid.forEach(({ input, expected }) => {
        const result = InputValidator.validateWeiAmount(input);
        expect(result).toBe(expected);
      });
    });

    test('rejects invalid amount formats', () => {
      VALIDATION_TEST_CASES.amounts.invalid.forEach(input => {
        expect(() => InputValidator.validateWeiAmount(input))
          .toThrow();
      });
    });
  });

  describe('Gas parameter validation with exact values', () => {
    test('validates gas limits with exact values', () => {
      VALIDATION_TEST_CASES.gasLimits.valid.forEach(({ input, expected }) => {
        const result = InputValidator.validateGasLimit(input);
        expect(result).toBe(expected);
      });
    });

    test('rejects invalid gas limits', () => {
      VALIDATION_TEST_CASES.gasLimits.invalid.forEach(input => {
        expect(() => InputValidator.validateGasLimit(input))
          .toThrow();
      });
    });

    test('validates gas prices with exact values', () => {
      VALIDATION_TEST_CASES.gasPrices.valid.forEach(({ input, expected }) => {
        const result = InputValidator.validateGasPrice(input);
        expect(result).toBe(expected);
      });
    });

    test('rejects invalid gas prices', () => {
      VALIDATION_TEST_CASES.gasPrices.invalid.forEach(input => {
        expect(() => InputValidator.validateGasPrice(input))
          .toThrow();
      });
    });
  });

  describe('Value validation edge cases', () => {
    test('rejects negative wei value', () => {
      // Try to trigger the negative value check in validateWeiAmount
      expect(() => InputValidator.validateWeiAmount('-1'))
        .toThrow('Value cannot be negative');
    });
  });

  describe('Edge case validations', () => {
    test('rejects negative gas limit', () => {
      expect(() => InputValidator.validateGasLimit('-100'))
        .toThrow('Invalid gas limit');
    });

    test('rejects non-numeric gas limit', () => {
      expect(() => InputValidator.validateGasLimit('abc'))
        .toThrow('Invalid gas limit');
    });

    test('rejects negative chain ID', () => {
      expect(() => InputValidator.validateChainId('-1'))
        .toThrow('Invalid chain ID');
    });
    
    test('rejects zero chain ID', () => {
      expect(() => InputValidator.validateChainId('0'))
        .toThrow('Invalid chain ID');
    });
  });

  describe('Nonce validation with exact values', () => {
    test('validates nonces correctly', () => {
      const testCases = [
        { input: '0', expected: 0n },
        { input: '1', expected: 1n },
        { input: '100', expected: 100n },
        { input: '999999', expected: 999999n }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = InputValidator.validateNonce(input);
        expect(result).toBe(expected);
      });
    });

    test('rejects negative nonce', () => {
      expect(() => InputValidator.validateNonce('-1'))
        .toThrow('Nonce cannot be negative');
    });
  });

  describe('Chain ID validation with exact values', () => {
    test('validates known chain IDs', () => {
      VALIDATION_TEST_CASES.chainIds.valid.forEach(({ input, expected }) => {
        const result = InputValidator.validateChainId(input);
        expect(result).toBe(expected);
      });
    });

    test('rejects invalid chain IDs', () => {
      VALIDATION_TEST_CASES.chainIds.invalid.forEach(input => {
        expect(() => InputValidator.validateChainId(input))
          .toThrow('Invalid chain ID');
      });
    });
  });

  describe('Error codes', () => {
    test('throws WalletError with correct codes', () => {
      try {
        InputValidator.validateAddress('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletError);
        expect((error as WalletError).code).toBe('INVALID_ADDRESS');
      }

      try {
        InputValidator.validateWeiAmount('-1');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletError);
        expect((error as WalletError).code).toBe('NEGATIVE_VALUE');
      }

      try {
        InputValidator.validateGasLimit('1000');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletError);
        expect((error as WalletError).code).toBe('GAS_LIMIT_TOO_LOW');
      }
    });
  });
});