import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getErrorMessage, logError, retryApiCall, withErrorHandling } from '../errorHandler';

describe('errorHandler', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // React 개발 모드 경고만 필터링하도록 수정
    console.error = (...args) => {
      if (typeof args[0] === 'string' && (
        args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: componentWillReceiveProps') ||
        args[0].includes('Warning: findDOMNode is deprecated')
      )) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    console.warn = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('returns default message for null error', () => {
      expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('returns appropriate message for API response errors', () => {
      const error = {
        response: { status: 400 }
      };
      expect(getErrorMessage(error)).toBe('잘못된 요청입니다. 입력값을 확인해주세요.');
    });

    it('returns network error message for request errors', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };
      expect(getErrorMessage(error)).toBe('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
    });

    it('returns error message for other errors', () => {
      const error = new Error('Custom error');
      expect(getErrorMessage(error)).toBe('Custom error');
    });
  });

  describe('logError', () => {
    it('logs error with context in development', () => {
      const error = new Error('Test error');
      const context = 'test context';
      
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleErrorSpy = vi.spyOn(console, 'error');
      logError(error, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Error]', expect.objectContaining({
        context,
        message: error.message,
        stack: error.stack
      }));
      
      process.env.NODE_ENV = originalNodeEnv;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('retryApiCall', () => {
    it('retries failed API calls', async () => {
      const apiCall = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const result = await retryApiCall(apiCall, 3, 100);
      
      expect(result).toBe('success');
      expect(apiCall).toHaveBeenCalledTimes(3);
    });

    it('throws error after max retries', async () => {
      const error = new Error('API Error');
      const apiCall = vi.fn().mockRejectedValue(error);

      await expect(retryApiCall(apiCall, 2, 100))
        .rejects
        .toThrow('API Error');
      
      expect(apiCall).toHaveBeenCalledTimes(2);
    });

    it('does not retry on certain HTTP status codes', async () => {
      const error = {
        response: { status: 404 },
        message: 'Not Found'
      };
      const apiCall = vi.fn().mockRejectedValue(error);

      await expect(retryApiCall(apiCall, 3, 100))
        .rejects
        .toEqual(error);
      
      expect(apiCall).toHaveBeenCalledTimes(1);
    });
  });

  describe('withErrorHandling', () => {
    it('wraps function with error handling', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(fn, 'test');

      const result = await wrappedFn();
      expect(result).toBe('success');
    });

    it('handles errors appropriately', async () => {
      const error = new Error('Test error');
      const fn = vi.fn().mockRejectedValue(error);
      const wrappedFn = withErrorHandling(fn, 'test');

      await expect(wrappedFn())
        .rejects
        .toThrow('Test error');
    });
  });
}); 
