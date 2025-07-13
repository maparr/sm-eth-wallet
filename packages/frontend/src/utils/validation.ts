/**
 * Frontend validation utilities
 */

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidAmount = (amount: string): boolean => {
  if (!amount || amount.trim() === '') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const isValidGasPrice = (gasPrice: string): boolean => {
  if (!gasPrice || gasPrice.trim() === '') return false;
  const num = parseFloat(gasPrice);
  return !isNaN(num) && num >= 0;
};

export const isValidGasLimit = (gasLimit: string): boolean => {
  if (!gasLimit || gasLimit.trim() === '') return false;
  const num = parseInt(gasLimit);
  return !isNaN(num) && num >= 21000 && num <= 30000000;
};

export const isValidNonce = (nonce: string): boolean => {
  if (!nonce || nonce.trim() === '') return false;
  const num = parseInt(nonce);
  return !isNaN(num) && num >= 0;
};