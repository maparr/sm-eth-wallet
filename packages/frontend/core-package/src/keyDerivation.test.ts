import { SecureKeyManager } from './keyDerivation';
import { WalletError } from './types';
import { TEST_MNEMONIC, BIP44_TEST_VECTORS, MNEMONIC_TEST_CASES } from './__tests__/test-constants';

describe('SecureKeyManager', () => {
  let keyManager: SecureKeyManager;

  beforeEach(() => {
    keyManager = new SecureKeyManager(TEST_MNEMONIC);
  });

  afterEach(() => {
    keyManager.dispose();
  });

  describe('Mnemonic validation', () => {
    test('accepts valid 12-word mnemonic', () => {
      expect(() => new SecureKeyManager(TEST_MNEMONIC)).not.toThrow();
    });

    test('rejects invalid word count', () => {
      expect(() => new SecureKeyManager('test test test'))
        .toThrow('Mnemonic must be 12, 15, 18, 21, or 24 words');
    });

    test('rejects invalid words', () => {
      expect(() => new SecureKeyManager('invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid'))
        .toThrow('Invalid words found: invalid, invalid, invalid, invalid, invalid, invalid, invalid, invalid, invalid, invalid, invalid, invalid');
    });

    test('rejects invalid checksum', () => {
      // Valid words but invalid checksum (12 abandons should fail)
      expect(() => new SecureKeyManager('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'))
        .toThrow('Invalid mnemonic checksum');
    });
  });

  describe('Account derivation with exact values', () => {
    test('derives first account with exact address and keys', () => {
      const account = keyManager.deriveAccount(0);
      
      // Exact values from BIP44 test vectors
      expect(account.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      expect(account.derivationPath).toBe("m/44'/60'/0'/0/0");
      expect(account.index).toBe(0);
      
      // Verify exact private key
      const privateKeyHex = Buffer.from(account.privateKey).toString('hex');
      expect(privateKeyHex).toBe('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
      
      // Verify exact uncompressed public key
      const publicKeyHex = Buffer.from(account.publicKey).toString('hex');
      expect(publicKeyHex).toBe('048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5');
    });

    test('derives multiple accounts with exact addresses', () => {
      const expectedAddresses = [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
      ];

      for (let i = 0; i < 5; i++) {
        const account = keyManager.deriveAccount(i);
        expect(account.address).toBe(expectedAddresses[i]);
        expect(account.derivationPath).toBe(`m/44'/60'/0'/0/${i}`);
      }
    });

    test('handles large account indices', () => {
      const account = keyManager.deriveAccount(2147483647); // Max hardened key index
      expect(account.index).toBe(2147483647);
      expect(account.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  describe('Security', () => {
    test('disposes sensitive data', () => {
      const account = keyManager.deriveAccount(0);
      expect(account.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      
      keyManager.dispose();
      
      expect(() => keyManager.deriveAccount(0))
        .toThrow('Key manager not initialized');
    });

    test('private keys are Uint8Array of 32 bytes', () => {
      const account = keyManager.deriveAccount(0);
      expect(account.privateKey).toBeInstanceOf(Uint8Array);
      expect(account.privateKey.length).toBe(32);
    });

    test('public keys are Uint8Array of 65 bytes (uncompressed)', () => {
      const account = keyManager.deriveAccount(0);
      expect(account.publicKey).toBeInstanceOf(Uint8Array);
      expect(account.publicKey.length).toBe(65);
      expect(account.publicKey[0]).toBe(0x04); // Uncompressed public key prefix
    });
  });

  describe('Error handling', () => {
    test('throws WalletError with correct code for empty mnemonic', () => {
      try {
        new SecureKeyManager('');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletError);
        expect((error as WalletError).code).toBe('INVALID_MNEMONIC_LENGTH');
      }
    });

    test('throws WalletError for derivation failure', () => {
      // Force an error by disposing before deriving
      keyManager.dispose();
      
      try {
        keyManager.deriveAccount(0);
      } catch (error) {
        expect(error).toBeInstanceOf(WalletError);
        expect((error as WalletError).code).toBe('NOT_INITIALIZED');
      }
    });
  });
});