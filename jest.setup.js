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
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleError.apply(console, args);
}; 
