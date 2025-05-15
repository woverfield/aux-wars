import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
}); 