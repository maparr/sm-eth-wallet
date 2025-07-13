import { MinimalEVMWallet, SimpleWalletAPI } from './wallet';
import { WalletError } from './types';
import { TEST_MNEMONIC, BIP44_TEST_VECTORS, VALIDATION_TEST_CASES } from './__tests__/test-constants';

describe('MinimalEVMWallet', () => {
  let wallet: MinimalEVMWallet;

  beforeEach(() => {
    wallet = new MinimalEVMWallet();
  });

  afterEach(() => {
    wallet.dispose();
  });

  describe('Wallet initialization and account management', () => {
    test('initializes wallet with test mnemonic', () => {
      wallet.createFromMnemonic(TEST_MNEMONIC);
      const address = wallet.getAddress();
      expect(address).toBe(BIP44_TEST_VECTORS[0].address);
    });

    test('derives accounts with exact test vector addresses', () => {
      wallet.createFromMnemonic(TEST_MNEMONIC);
      
      BIP44_TEST_VECTORS.forEach((vector, index) => {
        const account = wallet.deriveAccount(index);
        expect(account.address).toBe(vector.address);
        expect(account.derivationPath).toBe(vector.path);
        expect(account.index).toBe(index);
      });
    });

    test('throws error when wallet not initialized', () => {
      expect(() => wallet.getAddress()).toThrow('Wallet not initialized');
    });

    test('validates addresses correctly', () => {
      VALIDATION_TEST_CASES.addresses.valid.forEach(({ input, expected }) => {
        const result = wallet.validateAddress(input);
        expect(result).toBe(expected);
      });
    });

    test('converts amounts to Wei correctly', () => {
      VALIDATION_TEST_CASES.amounts.valid.forEach(({ input, expected }) => {
        const result = wallet.convertToWei(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Transaction building and signing', () => {
    beforeEach(() => {
      wallet.createFromMnemonic(TEST_MNEMONIC);
    });

    test('builds transaction with exact parameters', () => {
      const tx = wallet.buildTransaction({
        to: BIP44_TEST_VECTORS[1].address,
        value: '1.0',
        nonce: '0',
        gasPrice: '20000000000',
        gasLimit: '21000',
        chainId: '1'
      });

      expect(tx.to).toBe(BIP44_TEST_VECTORS[1].address);
      expect(tx.value).toBe(1000000000000000000n);
      expect(tx.nonce).toBe(0n);
      expect(tx.gasPrice).toBe(20000000000n);
      expect(tx.gasLimit).toBe(21000n);
      expect(tx.chainId).toBe(1);
      expect(tx.data).toBe('0x');
    });

    test('signs transaction with exact v-values for different networks', async () => {
      const networks = [
        { chainId: 1, expectedV: [37, 38] },
        { chainId: 137, expectedV: [309, 310] },
        { chainId: 42161, expectedV: [84357, 84358] }
      ];

      for (const network of networks) {
        const tx = wallet.buildTransaction({
          to: BIP44_TEST_VECTORS[1].address,
          value: '0.1',
          nonce: '0',
          gasPrice: '20000000000',
          gasLimit: '21000',
          chainId: network.chainId.toString()
        });

        const signedTx = await wallet.signTransaction(tx);
        expect(network.expectedV).toContain(signedTx.v);
        expect(signedTx.hash).toMatch(/^0x[0-9a-f]{64}$/);
        expect(signedTx.rawTransaction).toMatch(/^0x[0-9a-f]+$/);
      }
    });

    test('validates transaction parameters', () => {
      expect(() => wallet.buildTransaction({
        to: 'invalid-address',
        value: '1.0',
        nonce: '0',
        gasPrice: '20000000000',
        gasLimit: '21000',
        chainId: '1'
      })).toThrow('Invalid Ethereum address format');

      expect(() => wallet.buildTransaction({
        to: BIP44_TEST_VECTORS[1].address,
        value: '-1',
        nonce: '0',
        gasPrice: '20000000000',
        gasLimit: '21000',
        chainId: '1'
      })).toThrow('Value cannot be negative');

      expect(() => wallet.buildTransaction({
        to: BIP44_TEST_VECTORS[1].address,
        value: '1.0',
        nonce: '0',
        gasPrice: '20000000000',
        gasLimit: '20999',
        chainId: '1'
      })).toThrow('Gas limit too low');
    });
  });

  describe('Error handling', () => {
    test('handles invalid mnemonic', () => {
      expect(() => wallet.createFromMnemonic('invalid mnemonic'))
        .toThrow('Mnemonic must be 12, 15, 18, 21, or 24 words');
    });

    test('disposes wallet safely', () => {
      wallet.createFromMnemonic(TEST_MNEMONIC);
      wallet.dispose();
      expect(() => wallet.getAddress()).toThrow('Wallet not initialized');
    });
  });
});

describe('SimpleWalletAPI', () => {
  let simpleWallet: SimpleWalletAPI;

  beforeEach(() => {
    simpleWallet = new SimpleWalletAPI();
  });

  afterEach(() => {
    simpleWallet.dispose();
  });

  test('initializes with demo mnemonic', () => {
    const address = simpleWallet.getAddress();
    expect(address).toBe(BIP44_TEST_VECTORS[0].address);
  });

  test('creates signed transaction with exact values', async () => {
    const result = await simpleWallet.createSignedTransaction({
      to: BIP44_TEST_VECTORS[1].address,
      value: '0.5',
      nonce: '0',
      gasPrice: '30000000000',
      gasLimit: '21000',
      chainId: '1'
    });

    expect(result.signed.to).toBe(BIP44_TEST_VECTORS[1].address);
    expect(result.signed.value).toBe(500000000000000000n);
    expect(result.signed.v).toBeOneOf([37, 38]); // Mainnet v-values
    expect(result.signed.hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.txHash).toBeUndefined(); // No broadcast
  });

  test('validates all inputs through simple API', () => {
    const address = simpleWallet.validateAddress('0x742d35cc6634c0532925a3b844bc9e7595f8f832');
    expect(address).toBe('0x742D35cC6634c0532925A3B844Bc9e7595F8F832');

    const wei = simpleWallet.convertToWei('1.5');
    expect(wei).toBe(1500000000000000000n);
  });

  test('handles custom mnemonic', () => {
    const customWallet = new SimpleWalletAPI('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    expect(customWallet.getAddress()).not.toBe(BIP44_TEST_VECTORS[0].address);
    customWallet.dispose();
  });
});

// Add custom Jest matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(values: any[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: any, values: any[]) {
    const pass = values.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${values.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${values.join(', ')}`,
        pass: false,
      };
    }
  },
});