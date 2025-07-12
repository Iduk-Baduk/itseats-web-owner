import '@testing-library/jest-dom'; 

// Mock Vite's import.meta.env
globalThis.import = {
  meta: {
    env: {
      VITE_API_URL: "http://localhost:3001",
      VITE_TIMEOUT: "10000",
      MODE: "test"
    }
  }
};

// Mock console.error to not pollute test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // React 개발 모드 경고만 필터링
  if (typeof args[0] === 'string' && (
    args[0].includes('Warning: ReactDOM.render is deprecated') ||
    args[0].includes('Warning: componentWillReceiveProps') ||
    args[0].includes('Warning: findDOMNode is deprecated')
  )) {
    return;
  }
  originalConsoleError.apply(console, args);
}; 
