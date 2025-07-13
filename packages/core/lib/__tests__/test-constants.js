/**
 * Test Constants from BIP44 Spec
 * These are known test vectors for deterministic testing
 */
export const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
// BIP44 Test Vectors - Known addresses and keys for the test mnemonic
export const BIP44_TEST_VECTORS = [
    {
        index: 0,
        path: "m/44'/60'/0'/0/0",
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        publicKey: '0x038318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed75',
        privateKey: 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    },
    {
        index: 1,
        path: "m/44'/60'/0'/0/1",
        address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        publicKey: '0x02ba5734d8f7091719471e7f7ed6b9df170dc70cc661ca05e688601ad984f068b0',
        privateKey: '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    },
    {
        index: 2,
        path: "m/44'/60'/0'/0/2",
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        publicKey: '0x039d9031e97dd78ff8c15aa86939de9b1e791066a0224e331bc962a2099a7b1f04',
        privateKey: '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
    },
    {
        index: 3,
        path: "m/44'/60'/0'/0/3",
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        publicKey: '0x0220b871f3ced029e14472ec4ebc3c0448164942b123aa6af91a3386c1c403e0eb',
        privateKey: '7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
    },
    {
        index: 4,
        path: "m/44'/60'/0'/0/4",
        address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        publicKey: '0x03bf6ee64a8d2fdc551ec8bb9ef862ef6b4bcb1805cdc520c3aa5866c0575fd3b5',
        privateKey: '47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
    }
];
// Test constants for 100% coverage testing
export const VALIDATION_TEST_CASES = {
    addresses: {
        valid: [
            { input: '0x742d35cc6634c0532925a3b844bc9e7595f8f832', expected: '0x742D35cC6634c0532925A3B844Bc9e7595F8F832' },
            { input: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', expected: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
            { input: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', expected: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
            { input: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', expected: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed' }
        ],
        invalid: [
            '0x123', // Too short
            '0x' + 'g'.repeat(40), // Invalid characters
            'not-an-address', // Wrong format
            '0x' + '0'.repeat(41), // Too long
            '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1Beaed' // Wrong checksum
        ]
    },
    amounts: {
        valid: [
            { input: '1', expected: 1000000000000000000n },
            { input: '0.1', expected: 100000000000000000n },
            { input: '0.01', expected: 10000000000000000n },
            { input: '0.001', expected: 1000000000000000n },
            { input: '0.000000000000000001', expected: 1n },
            { input: '123.456789012345678', expected: 123456789012345678000n },
            { input: '1000000000000000000', expected: 1000000000000000000n }
        ],
        invalid: ['-1', '-0.1', '', 'not-a-number', '1.2.3']
    },
    gasLimits: {
        valid: [
            { input: '21000', expected: 21000 },
            { input: '100000', expected: 100000 },
            { input: '30000000', expected: 30000000 }
        ],
        invalid: ['20999', '30000001', '-100', 'abc']
    },
    gasPrices: {
        valid: [
            { input: '0', expected: 0n },
            { input: '1000000000', expected: 1000000000n },
            { input: '20000000000', expected: 20000000000n }
        ],
        invalid: ['-1']
    },
    chainIds: {
        valid: [
            { input: '1', expected: 1 },
            { input: '137', expected: 137 },
            { input: '42161', expected: 42161 },
            { input: '11155111', expected: 11155111 }
        ],
        invalid: ['0', '-1']
    }
};
export const SIGNING_TEST_CASES = {
    networks: [
        { chainId: 1, name: 'Ethereum', expectedV: [37, 38] },
        { chainId: 137, name: 'Polygon', expectedV: [309, 310] },
        { chainId: 42161, name: 'Arbitrum', expectedV: [84357, 84358] },
        { chainId: 11155111, name: 'Sepolia', expectedV: [22310257, 22310258] }
    ],
    transactions: [
        {
            name: 'mainnet transfer',
            tx: { nonce: 0n, gasPrice: 20000000000n, gasLimit: 21000n, to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', value: 1000000000000000000n, data: '0x', chainId: 1 }
        },
        {
            name: 'contract deployment',
            tx: { nonce: 0n, gasPrice: 20000000000n, gasLimit: 3000000n, to: '', value: 0n, data: '0x608060405234801561001057600080fd5b50', chainId: 1 }
        }
    ]
};
export const ERROR_TEST_CASES = {
    rpcErrors: [
        { input: { code: -32000, message: 'insufficient funds' }, provider: 'Test', expectedCode: 'INVALID_TRANSACTION' },
        { input: { code: -32001, message: 'nonce too low' }, provider: 'Test', expectedCode: 'RESOURCE_NOT_FOUND' },
        { input: { code: -32005, message: 'rate limited' }, provider: 'Test', expectedCode: 'RATE_LIMITED' },
        { input: { code: -99999, message: 'unknown' }, provider: 'Test', expectedCode: 'PROVIDER_ERROR' }
    ],
    retriableErrors: ['RATE_LIMITED', 'RESOURCE_UNAVAILABLE', 'NETWORK_TIMEOUT', 'PROVIDER_ERROR'],
    nonRetriableErrors: ['INVALID_TRANSACTION', 'INVALID_NONCE', 'INVALID_ADDRESS']
};
export const MNEMONIC_TEST_CASES = {
    valid: [
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'legal winner thank year wave sausage worth useful legal winner thank yellow'
    ],
    invalid: [
        'invalid mnemonic phrase', // Too short
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon invalid', // Invalid word
        '', // Empty
        'one two three four five six seven eight nine ten eleven' // 11 words
    ]
};
// Test transactions for signing
export const TEST_TRANSACTIONS = [
    {
        name: 'Simple ETH transfer',
        tx: {
            to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            value: '1000000000000000000', // 1 ETH
            nonce: '0',
            gasPrice: '20000000000', // 20 Gwei
            gasLimit: '21000',
            chainId: '1',
            data: '0x'
        }
    },
    {
        name: 'Polygon transaction',
        tx: {
            to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            value: '500000000000000000', // 0.5 MATIC
            nonce: '0',
            gasPrice: '40000000000', // 40 Gwei
            gasLimit: '21000',
            chainId: '137',
            data: '0x'
        }
    }
];
export const TEST_PRIVATE_KEY = Buffer.from('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 'hex');
// Helper function to create PrivateKey from hex string or buffer
export function createPrivateKey(keyData) {
    if (typeof keyData === 'string') {
        return Buffer.from(keyData.replace('0x', ''), 'hex');
    }
    else if (keyData instanceof Buffer) {
        return keyData;
    }
    else {
        return new Uint8Array(keyData);
    }
}
