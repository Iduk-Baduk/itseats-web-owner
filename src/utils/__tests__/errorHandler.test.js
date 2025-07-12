import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, handleError, withErrorHandling } from '../errorHandler';
import { ERROR_TYPES, ERROR_MESSAGES } from '../../constants/errorTypes';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  describe('getErrorMessage', () => {
    it('returns unknown error message for null error', () => {
      expect(getErrorMessage(null)).toBe(ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]);
    });

    it('returns API error message when available', () => {
      const error = {
        response: {
          data: {
            message: '커스텀 에러 메시지'
          }
        }
      };
      expect(getErrorMessage(error)).toBe('커스텀 에러 메시지');
    });

    it('returns auth error message for 401/403 status', () => {
      const error = {
        response: {
          status: 401
        }
      };
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES[ERROR_TYPES.AUTH]);
    });

    it('returns network error message for offline status', () => {
      const originalNavigator = global.navigator;
      global.navigator = { onLine: false };
      
      expect(getErrorMessage(new Error())).toBe(ERROR_MESSAGES[ERROR_TYPES.NETWORK]);
      
      global.navigator = originalNavigator;
    });
  });

  describe('handleError', () => {
    it('shows toast message by default', () => {
      const error = new Error('테스트 에러');
      handleError(error);
      expect(toast.error).toHaveBeenCalled();
    });

    it('sets form error when setError is provided', () => {
      const error = new Error('테스트 에러');
      const setError = vi.fn();
      handleError(error, { setError });
      expect(setError).toHaveBeenCalled();
    });

    it('logs error with context', () => {
      const error = new Error('테스트 에러');
      const context = '테스트 컨텍스트';
      handleError(error, { context });
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error);
    });
  });

  describe('withErrorHandling', () => {
    it('wraps function and handles errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('테스트 에러'));
      const wrappedFn = withErrorHandling(mockFn, '테스트 작업');

      await expect(wrappedFn()).rejects.toThrow('테스트 에러');
      expect(toast.error).toHaveBeenCalled();
    });

    it('passes through successful results', async () => {
      const expectedResult = { success: true };
      const mockFn = vi.fn().mockResolvedValue(expectedResult);
      const wrappedFn = withErrorHandling(mockFn, '테스트 작업');

      const result = await wrappedFn();
      expect(result).toEqual(expectedResult);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
}); 
