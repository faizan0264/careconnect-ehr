import '@testing-library/jest-dom';

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollTo
window.scrollTo = vi.fn();

// Suppress React act() warnings in tests
global.IS_REACT_ACT_ENVIRONMENT = true;
