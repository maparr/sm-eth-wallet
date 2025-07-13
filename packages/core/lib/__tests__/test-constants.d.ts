/**
 * Test Constants from BIP44 Spec
 * These are known test vectors for deterministic testing
 */
export declare const TEST_MNEMONIC = "test test test test test test test test test test test junk";
export declare const BIP44_TEST_VECTORS: {
    index: number;
    path: string;
    address: string;
    publicKey: string;
    privateKey: string;
}[];
export declare const VALIDATION_TEST_CASES: {
    addresses: {
        valid: {
            input: string;
            expected: string;
        }[];
        invalid: string[];
    };
    amounts: {
        valid: {
            input: string;
            expected: bigint;
        }[];
        invalid: string[];
    };
    gasLimits: {
        valid: {
            input: string;
            expected: number;
        }[];
        invalid: string[];
    };
    gasPrices: {
        valid: {
            input: string;
            expected: bigint;
        }[];
        invalid: string[];
    };
    chainIds: {
        valid: {
            input: string;
            expected: number;
        }[];
        invalid: string[];
    };
};
export declare const SIGNING_TEST_CASES: {
    networks: {
        chainId: number;
        name: string;
        expectedV: number[];
    }[];
    transactions: {
        name: string;
        tx: {
            nonce: bigint;
            gasPrice: bigint;
            gasLimit: bigint;
            to: string;
            value: bigint;
            data: string;
            chainId: number;
        };
    }[];
};
export declare const ERROR_TEST_CASES: {
    rpcErrors: {
        input: {
            code: number;
            message: string;
        };
        provider: string;
        expectedCode: string;
    }[];
    retriableErrors: string[];
    nonRetriableErrors: string[];
};
export declare const MNEMONIC_TEST_CASES: {
    valid: string[];
    invalid: string[];
};
export declare const TEST_TRANSACTIONS: {
    name: string;
    tx: {
        to: string;
        value: string;
        nonce: string;
        gasPrice: string;
        gasLimit: string;
        chainId: string;
        data: string;
    };
}[];
import { PrivateKey } from '../types';
export declare const TEST_PRIVATE_KEY: PrivateKey;
export declare function createPrivateKey(keyData: string | Buffer | Uint8Array): PrivateKey;
//# sourceMappingURL=test-constants.d.ts.map