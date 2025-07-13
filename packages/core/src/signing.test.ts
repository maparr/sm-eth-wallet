import { EIP155Signer } from './signing';
import { EIP155Transaction, WalletError } from './types';
import { RLP } from '@ethereumjs/rlp';
import { SIGNING_TEST_CASES, TEST_PRIVATE_KEY, createPrivateKey } from './__tests__/test-constants';

describe('EIP155Signer', () => {
  let signer: EIP155Signer;

  beforeEach(() => {
    signer = new EIP155Signer();
  });

  describe('Transaction signing with exact values', () => {
    test('signs mainnet transaction with exact v-value', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n, // 20 Gwei
        gasLimit: 21000n,
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 1000000000000000000n, // 1 ETH
        data: '0x',
        chainId: 1 // Mainnet
      };

      const signedTx = await signer.signTransaction(tx, TEST_PRIVATE_KEY);

      // Exact v-value for chainId 1: v = chainId * 2 + 35 + recovery
      expect([37, 38]).toContain(signedTx.v);
      
      // Verify signature components are valid
      expect(signedTx.r).toBeGreaterThan(0n);
      expect(signedTx.r).toBeLessThan(2n ** 256n);
      expect(signedTx.s).toBeGreaterThan(0n);
      expect(signedTx.s).toBeLessThan(2n ** 256n);
      
      // Verify transaction hash format
      expect(signedTx.hash).toMatch(/^0x[0-9a-f]{64}$/);
      
      // Verify raw transaction format
      expect(signedTx.rawTransaction).toMatch(/^0x[0-9a-f]+$/);
      
      // Decode and verify RLP structure
      const decoded = RLP.decode(Buffer.from(signedTx.rawTransaction.slice(2), 'hex'));
      expect(Array.isArray(decoded)).toBe(true);
      expect(decoded).toHaveLength(9);
    });

    test('signs Polygon transaction with exact v-value', async () => {
      const tx: EIP155Transaction = {
        nonce: 100n,
        gasPrice: 30000000000n, // 30 Gwei
        gasLimit: 50000n,
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        value: 500000000000000000n, // 0.5 MATIC
        data: '0x',
        chainId: 137 // Polygon
      };

      const signedTx = await signer.signTransaction(tx, TEST_PRIVATE_KEY);

      // Exact v-value for chainId 137: v = 137 * 2 + 35 + recovery = 309 or 310
      expect([309, 310]).toContain(signedTx.v);
    });

    test('signs Arbitrum transaction with exact v-value', async () => {
      const tx: EIP155Transaction = {
        nonce: 1000n,
        gasPrice: 100000000n, // 0.1 Gwei
        gasLimit: 1000000n,
        to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        value: 0n,
        data: '0x095ea7b3', // approve function selector
        chainId: 42161 // Arbitrum
      };

      const signedTx = await signer.signTransaction(tx, TEST_PRIVATE_KEY);

      // Exact v-value for chainId 42161: v = 42161 * 2 + 35 + recovery = 84357 or 84358
      expect([84357, 84358]).toContain(signedTx.v);
    });

    test('produces different signatures with extraEntropy', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 21000n,
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 1000000000000000000n,
        data: '0x',
        chainId: 1
      };

      const sig1 = await signer.signTransaction(tx, TEST_PRIVATE_KEY);
      const sig2 = await signer.signTransaction(tx, TEST_PRIVATE_KEY);

      // With extraEntropy, signatures should be different
      expect(sig1.r !== sig2.r || sig1.s !== sig2.s).toBe(true);
      
      // But both should have valid v-values
      expect([37, 38]).toContain(sig1.v);
      expect([37, 38]).toContain(sig2.v);
    });
  });

  describe('Transaction validation', () => {
    test('validates recipient address format', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 21000n,
        to: 'invalid-address',
        value: 0n,
        data: '0x',
        chainId: 1
      };

      await expect(signer.signTransaction(tx, TEST_PRIVATE_KEY))
        .rejects.toThrow('Invalid recipient address format');
    });

    test('validates gas limit minimum', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 20999n, // Below minimum
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 0n,
        data: '0x',
        chainId: 1
      };

      await expect(signer.signTransaction(tx, TEST_PRIVATE_KEY))
        .rejects.toThrow('Gas limit too low');
    });

    test('validates gas limit maximum', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 30000001n, // Above maximum
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 0n,
        data: '0x',
        chainId: 1
      };

      await expect(signer.signTransaction(tx, TEST_PRIVATE_KEY))
        .rejects.toThrow('Gas limit too high');
    });

    test('validates negative values', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 21000n,
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: -1n,
        data: '0x',
        chainId: 1
      };

      await expect(signer.signTransaction(tx, TEST_PRIVATE_KEY))
        .rejects.toThrow('Value cannot be negative');
    });

    test('validates chain ID', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 21000n,
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 0n,
        data: '0x',
        chainId: 0 // Invalid
      };

      await expect(signer.signTransaction(tx, TEST_PRIVATE_KEY))
        .rejects.toThrow('Invalid chain ID');
    });

    test('validates private key format', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 21000n,
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 0n,
        data: '0x',
        chainId: 1
      };

      const invalidKey = createPrivateKey(new Uint8Array(31)); // Too short
      await expect(signer.signTransaction(tx, invalidKey))
        .rejects.toThrow('Invalid private key format');
    });
  });

  describe('Contract deployment', () => {
    test('handles contract deployment (no to address)', async () => {
      const tx: EIP155Transaction = {
        nonce: 0n,
        gasPrice: 20000000000n,
        gasLimit: 3000000n,
        to: '', // Contract deployment
        value: 0n,
        data: '0x608060405234801561001057600080fd5b50', // Contract bytecode
        chainId: 1
      };

      const signedTx = await signer.signTransaction(tx, TEST_PRIVATE_KEY);
      
      expect([37, 38]).toContain(signedTx.v);
      expect(signedTx.hash).toMatch(/^0x[0-9a-f]{64}$/);
    });
  });

  describe('RLP encoding', () => {
    test('encodes transaction correctly', async () => {
      const tx: EIP155Transaction = {
        nonce: 5n,
        gasPrice: 50000000000n, // 50 Gwei
        gasLimit: 100000n,
        to: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        value: 2500000000000000000n, // 2.5 ETH
        data: '0xa9059cbb', // transfer function
        chainId: 1
      };

      const signedTx = await signer.signTransaction(tx, TEST_PRIVATE_KEY);
      
      // Decode RLP to verify structure
      const decoded = RLP.decode(Buffer.from(signedTx.rawTransaction.slice(2), 'hex')) as Buffer[];
      
      // Verify nonce
      const nonce = decoded[0].length === 0 ? 0n : BigInt('0x' + decoded[0].toString('hex'));
      expect(nonce).toBe(5n);
      
      // Verify gas price
      const gasPrice = BigInt('0x' + decoded[1].toString('hex'));
      expect(gasPrice).toBe(50000000000n);
      
      // Verify gas limit
      const gasLimit = BigInt('0x' + decoded[2].toString('hex'));
      expect(gasLimit).toBe(100000n);
      
      // Verify to address
      const to = '0x' + decoded[3].toString('hex');
      expect(to.toLowerCase()).toBe(tx.to.toLowerCase());
      
      // Verify value
      const value = BigInt('0x' + decoded[4].toString('hex'));
      expect(value).toBe(2500000000000000000n);
    });
  });
});