import { EIP155Transaction } from './types.js';
import { InputValidator } from './validation.js';

export class TransactionBuilder {
  private transaction: Partial<EIP155Transaction> = {};
  
  setTo(to: string): TransactionBuilder {
    this.transaction.to = InputValidator.validateAddress(to);
    return this;
  }
  
  setValue(value: string): TransactionBuilder {
    this.transaction.value = InputValidator.validateWeiAmount(value);
    return this;
  }
  
  setGasPrice(gasPrice: string): TransactionBuilder {
    this.transaction.gasPrice = InputValidator.validateGasPrice(gasPrice);
    return this;
  }
  
  setGasLimit(gasLimit: string): TransactionBuilder {
    this.transaction.gasLimit = BigInt(InputValidator.validateGasLimit(gasLimit));
    return this;
  }
  
  setNonce(nonce: string): TransactionBuilder {
    this.transaction.nonce = InputValidator.validateNonce(nonce);
    return this;
  }
  
  setChainId(chainId: string): TransactionBuilder {
    this.transaction.chainId = InputValidator.validateChainId(chainId);
    return this;
  }
  
  setData(data: string): TransactionBuilder {
    // Ensure data has 0x prefix
    this.transaction.data = data.startsWith('0x') ? data : '0x' + data;
    return this;
  }
  
  build(): EIP155Transaction {
    // Validate all required fields are present
    const required = ['to', 'value', 'nonce', 'gasPrice', 'gasLimit', 'chainId'];
    const missing = required.filter(field => 
      this.transaction[field as keyof EIP155Transaction] === undefined
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required transaction fields: ${missing.join(', ')}`);
    }
    
    // Set default data if not provided
    if (!this.transaction.data) {
      this.transaction.data = '0x';
    }
    
    return this.transaction as EIP155Transaction;
  }
  
  // Create transaction from raw parameters
  static fromParams(params: {
    to: string;
    value: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    chainId: string;
    data?: string;
  }): EIP155Transaction {
    const builder = new TransactionBuilder();
    
    builder
      .setTo(params.to)
      .setValue(params.value)
      .setNonce(params.nonce)
      .setGasPrice(params.gasPrice)
      .setGasLimit(params.gasLimit)
      .setChainId(params.chainId);
    
    if (params.data) {
      builder.setData(params.data);
    }
    
    return builder.build();
  }
}