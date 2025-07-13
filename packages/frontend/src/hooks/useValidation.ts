import { useState, useCallback, useEffect } from 'react';
import { ValidationErrors, TransactionForm } from '../types';

export const useValidation = (form: TransactionForm, balance: string) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    
    // Validate address - only basic format check
    if (form.to) {
      if (!/^0x[0-9a-fA-F]{40}$/i.test(form.to)) {
        newErrors.address = 'Invalid Ethereum address format';
      }
      // Accept any valid format regardless of checksum
    }
    
    // Validate amount
    if (form.value) {
      try {
        const value = parseFloat(form.value);
        if (value <= 0) {
          newErrors.amount = 'Amount must be greater than 0';
        }
        // Remove balance checking per user request
      } catch (err) {
        newErrors.amount = 'Invalid amount';
      }
    }
    
    // Validate gas price
    if (form.gasPrice) {
      const gasPrice = parseFloat(form.gasPrice);
      if (gasPrice < 0) {
        newErrors.gasPrice = 'Gas price cannot be negative';
      }
    }
    
    // Validate gas limit
    if (form.gasLimit) {
      const gasLimit = parseInt(form.gasLimit);
      if (gasLimit < 21000) {
        newErrors.gasLimit = 'Gas limit must be at least 21000';
      } else if (gasLimit > 30000000) {
        newErrors.gasLimit = 'Gas limit too high (max 30M)';
      }
    }
    
    // Validate nonce
    if (form.nonce) {
      const nonce = parseInt(form.nonce);
      if (nonce < 0) {
        newErrors.nonce = 'Nonce cannot be negative';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, balance]);

  // Auto-validate when form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [validateForm]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validateForm,
    clearErrors
  };
};