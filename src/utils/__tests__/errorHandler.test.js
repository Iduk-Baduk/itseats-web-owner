import { describe, test, expect, vi } from 'vitest';
import { getErrorMessage, logError, withErrorHandling } from '../errorHandler';

describe('Error Handler', () => {
  describe('getErrorMessage', () => {
    test('handles API response errors', () => {
      const cases = [
        {
          error: { response: { status: 400 } },
          expected: '잘못된 요청입니다. 입력값을 확인해주세요.',
        },
        {
          error: { response: { status: 401 } },
          expected: '인증이 필요합니다. 다시 로그인해주세요.',
        },
        {
          error: { response: { status: 403 } },
          expected: '접근 권한이 없습니다.',
        },
        {
          error: { response: { status: 404 } },
          expected: '요청하신 정보를 찾을 수 없습니다.',
        },
        {
          error: { response: { status: 500 } },
          expected: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      ];

      cases.forEach(({ error, expected }) => {
        expect(getErrorMessage(error)).toBe(expected);
      });
    });

    test('handles network errors', () => {
      const error = { request: {} };
      expect(getErrorMessage(error)).toBe(
        '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
      );
    });

    test('handles unknown errors', () => {
      expect(getErrorMessage()).toBe('알 수 없는 오류가 발생했습니다.');
      expect(getErrorMessage({})).toBe('알 수 없는 오류가 발생했습니다.');
    });

    test('handles custom error messages', () => {
      const error = new Error('커스텀 에러 메시지');
      expect(getErrorMessage(error)).toBe('커스텀 에러 메시지');
    });
  });

  describe('logError', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalConsoleError = console.error;

    beforeEach(() => {
      console.error = vi.fn();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      console.error = originalConsoleError;
    });

    test('logs errors in development environment', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('테스트 에러');
      const context = '테스트 컨텍스트';

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        '[Error]',
        expect.objectContaining({
          context,
          message: error.message,
          stack: error.stack,
        })
      );
    });

    test('includes API response data in logs', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        message: '테스트 에러',
        response: {
          data: { detail: '상세 에러 정보' }
        }
      };

      logError(error);

      expect(console.error).toHaveBeenCalledWith(
        '[Error]',
        expect.objectContaining({
          message: error.message,
          response: error.response.data,
        })
      );
    });
  });

  describe('withErrorHandling', () => {
    test('passes through successful function calls', async () => {
      const fn = async () => 'success';
      const wrapped = withErrorHandling(fn, 'test');
      
      const result = await wrapped();
      expect(result).toBe('success');
    });

    test('handles and logs errors', async () => {
      const error = new Error('테스트 에러');
      const fn = async () => { throw error; };
      const wrapped = withErrorHandling(fn, 'test');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(wrapped()).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('preserves function arguments', async () => {
      const fn = async (a, b) => a + b;
      const wrapped = withErrorHandling(fn, 'test');
      
      const result = await wrapped(1, 2);
      expect(result).toBe(3);
    });
  });
}); 
