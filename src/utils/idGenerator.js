/**
 * 고유한 ID를 생성하는 함수
 * @returns {string} 생성된 고유 ID
 */
export const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}; 
