import { TransactionBuilder } from './transaction';
import { EIP155Transaction } from './types';

describe('TransactionBuilder', () => {
  let builder: TransactionBuilder;

  beforeEach(() => {
    builder = new TransactionBuilder();
  });

  describe('Building transactions with exact values', () => {
    test('builds complete transaction with all exact values', () => {
      const tx = builder
        .setTo('0x742d35cc6634c0532925a3b844bc9e7595f8f832')
        .setValue('1500000000000000000') // Exactly 1.5 ETH in Wei
        .setNonce('42')
        .setGasPrice('30000000000') // Exactly 30 Gwei
        .setGasLimit('21000')
        .setChainId('137') // Polygon
        .setData('0x095ea7b3')
        .build();

      // Verify exact values
      expect(tx.to).toBe('0x742D35cC6634c0532925A3B844Bc9e7595F8F832'); // Checksummed
      expect(tx.value).toBe(1500000000000000000n);
      expect(tx.nonce).toBe(42n);
      expect(tx.gasPrice).toBe(30000000000n);
      expect(tx.gasLimit).toBe(21000n);
      expect(tx.chainId).toBe(137);
      expect(tx.data).toBe('0x095ea7b3');
    });

    test('builds transaction with ETH amount conversion', () => {
      const tx = builder
        .setTo('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
        .setValue('2.5') // 2.5 ETH
        .setNonce('0')
        .setGasPrice('20000000000')
        .setGasLimit('50000')
        .setChainId('1')
        .build();

      expect(tx.value).toBe(2500000000000000000n); // Exactly 2.5 ETH in Wei
    });

    test('handles data field correctly', () => {
      // Without 0x prefix
      const tx1 = builder
        .setTo('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')
        .setValue('0')
        .setNonce('0')
        .setGasPrice('1000000000')
        .setGasLimit('100000')
        .setChainId('1')
        .setData('a9059cbb')
        .build();

      expect(tx1.data).toBe('0xa9059cbb');

      // With 0x prefix
      const tx2 = new TransactionBuilder()
        .setTo('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')
        .setValue('0')
        .setNonce('0')
        .setGasPrice('1000000000')
        .setGasLimit('100000')
        .setChainId('1')
        .setData('0xa9059cbb')
        .build();

      expect(tx2.data).toBe('0xa9059cbb');
    });

    test('defaults data to empty', () => {
      const tx = builder
        .setTo('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')
        .setValue('1000000000000000000')
        .setNonce('0')
        .setGasPrice('20000000000')
        .setGasLimit('21000')
        .setChainId('1')
        .build();

      expect(tx.data).toBe('0x');
    });
  });

  describe('Static factory method', () => {
    test('creates transaction from params object with exact values', () => {
      const params = {
        to: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        value: '500000000000000000', // 0.5 ETH in Wei
        nonce: '100',
        gasPrice: '50000000000', // 50 Gwei
        gasLimit: '200000',
        chainId: '42161', // Arbitrum
        data: '0x23b872dd'
      };

      const tx = TransactionBuilder.fromParams(params);

      expect(tx.to).toBe('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'); // Checksummed
      expect(tx.value).toBe(500000000000000000n);
      expect(tx.nonce).toBe(100n);
      expect(tx.gasPrice).toBe(50000000000n);
      expect(tx.gasLimit).toBe(200000n);
      expect(tx.chainId).toBe(42161);
      expect(tx.data).toBe('0x23b872dd');
    });

    test('handles optional data field', () => {
      const params = {
        to: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        value: '0',
        nonce: '0',
        gasPrice: '1000000000',
        gasLimit: '21000',
        chainId: '1'
      };

      const tx = TransactionBuilder.fromParams(params);
      expect(tx.data).toBe('0x');
    });
  });

  describe('Validation', () => {
    test('requires all fields to be set', () => {
      expect(() => {
        builder
          .setTo('0x742d35cc6634c0532925a3b844bc9e7595f8f832')
          .setValue('1000000000000000000')
          // Missing other required fields
          .build();
      }).toThrow('Missing required transaction fields: nonce, gasPrice, gasLimit, chainId');
    });

    test('validates addresses through InputValidator', () => {
      expect(() => {
        builder.setTo('invalid-address');
      }).toThrow('Invalid Ethereum address format');
    });

    test('validates amounts through InputValidator', () => {
      expect(() => {
        builder.setValue('-1');
      }).toThrow('Value cannot be negative');
    });

    test('validates gas parameters', () => {
      expect(() => {
        builder.setGasLimit('20999');
      }).toThrow('Gas limit too low');

      expect(() => {
        builder.setGasPrice('-1');
      }).toThrow('Gas price cannot be negative');
    });

    test('validates chain ID', () => {
      expect(() => {
        builder.setChainId('0');
      }).toThrow('Invalid chain ID');
    });
  });

  describe('Type conversions', () => {
    test('converts string inputs to correct types', () => {
      const tx = builder
        .setTo('0x742d35cc6634c0532925a3b844bc9e7595f8f832')
        .setValue('999999999999999999999') // Large Wei amount
        .setNonce('4294967295') // Max uint32
        .setGasPrice('999999999999999') // High gas price
        .setGasLimit('30000000') // Max gas limit
        .setChainId('999999') // Large chain ID
        .build();

      expect(tx.value).toBe(999999999999999999999n);
      expect(tx.nonce).toBe(4294967295n);
      expect(tx.gasPrice).toBe(999999999999999n);
      expect(tx.gasLimit).toBe(30000000n);
      expect(tx.chainId).toBe(999999);
    });
  });
});