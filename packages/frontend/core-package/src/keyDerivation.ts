import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { WalletAccount, PrivateKey, EthereumAddress, WalletError } from './types.js';

// Configure @noble/secp256k1 for synchronous operations
secp.etc.hmacSha256Sync = (k: Uint8Array, ...m: Uint8Array[]) => 
  hmac(sha256, k, secp.etc.concatBytes(...m));

export class SecureKeyManager {
  private seed: Uint8Array | null = null;
  private hdkey: HDKey | null = null;
  
  constructor(mnemonic: string = "test test test test test test test test test test test junk") {
    this.validateMnemonic(mnemonic);
    this.initializeKeys(mnemonic);
  }
  
  private validateMnemonic(mnemonic: string): void {
    const words = mnemonic.trim().toLowerCase().split(/\s+/);
    
    // Length validation
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      throw new WalletError(
        'Mnemonic must be 12, 15, 18, 21, or 24 words',
        'INVALID_MNEMONIC_LENGTH'
      );
    }
    
    // Wordlist validation
    const invalidWords = words.filter(word => !wordlist.includes(word));
    if (invalidWords.length > 0) {
      throw new WalletError(
        `Invalid words found: ${invalidWords.join(', ')}`,
        'INVALID_MNEMONIC_WORDS'
      );
    }
    
    // Checksum validation
    if (!bip39.validateMnemonic(mnemonic, wordlist)) {
      throw new WalletError(
        'Invalid mnemonic checksum',
        'INVALID_MNEMONIC_CHECKSUM'
      );
    }
  }
  
  private initializeKeys(mnemonic: string): void {
    try {
      this.seed = bip39.mnemonicToSeedSync(mnemonic);
      this.hdkey = HDKey.fromMasterSeed(this.seed);
    } catch (error: unknown) {
      this.dispose();
      throw new WalletError(
        'Failed to initialize keys from mnemonic',
        'KEY_INITIALIZATION_FAILED'
      );
    }
  }
  
  public deriveAccount(index: number = 0): WalletAccount {
    if (!this.hdkey) {
      throw new WalletError('Key manager not initialized', 'NOT_INITIALIZED');
    }
    
    // Standard Ethereum derivation path: m/44'/60'/0'/0/index
    const path = `m/44'/60'/0'/0/${index}`;
    
    try {
      const derivedKey = this.hdkey.derive(path);
      if (!derivedKey.privateKey) {
        throw new WalletError('Failed to derive private key', 'DERIVATION_FAILED');
      }
      
      const privateKey = derivedKey.privateKey as PrivateKey;
      const publicKey = secp.getPublicKey(privateKey, false);
      const address = this.publicKeyToAddress(publicKey);
      
      return {
        address,
        privateKey,
        publicKey,
        derivationPath: path,
        index
      };
    } catch (error: unknown) {
      if (error instanceof WalletError) throw error;
      throw new WalletError(
        'Failed to derive account',
        'DERIVATION_FAILED'
      );
    }
  }
  
  private publicKeyToAddress(publicKey: Uint8Array): EthereumAddress {
    // Remove the 0x04 prefix for uncompressed public key
    const publicKeyBytes = publicKey.slice(1);
    
    // Keccak256 hash of the public key
    const addressHash = keccak_256(publicKeyBytes);
    
    // Take last 20 bytes as address
    const addressBytes = addressHash.slice(-20);
    
    // Convert to hex string (lowercase)
    const addressLower = Buffer.from(addressBytes).toString('hex');
    
    // Apply EIP-55 checksum
    const hashBytes = keccak_256(addressLower);
    const hash = Buffer.from(hashBytes).toString('hex');
    
    let checksumAddress = '0x';
    for (let i = 0; i < addressLower.length; i++) {
      const char = addressLower[i];
      // Only uppercase letters (a-f), not numbers
      if (/[a-f]/.test(char!) && parseInt(hash[i]!, 16) >= 8) {
        checksumAddress += char!.toUpperCase();
      } else {
        checksumAddress += char;
      }
    }
    
    return checksumAddress as EthereumAddress;
  }
  
  // Secure disposal of sensitive data
  public dispose(): void {
    if (this.seed) {
      this.seed.fill(0);
      this.seed = null;
    }
    this.hdkey = null;
  }
}