import { describe, it, expect } from 'vitest';
import { validateConfig, DEFAULT_CONFIG } from './schema.js';

describe('validateConfig', () => {
  it('returns default for null', () => {
    expect(validateConfig(null)).toEqual(DEFAULT_CONFIG);
  });

  it('returns default for non-object', () => {
    expect(validateConfig(42)).toEqual(DEFAULT_CONFIG);
    expect(validateConfig('bad')).toEqual(DEFAULT_CONFIG);
  });

  it('validates and fills missing fields', () => {
    const result = validateConfig({});
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('accepts valid config', () => {
    const input = {
      progressBar: false,
      alerts: { bell: false, notify: true },
      tickMs: 500,
    };
    expect(validateConfig(input)).toEqual(input);
  });

  it('ignores invalid progressBar type', () => {
    const result = validateConfig({ progressBar: 'yes' });
    expect(result.progressBar).toBe(true);
  });

  it('ignores invalid tickMs', () => {
    const result = validateConfig({ tickMs: -100 });
    expect(result.tickMs).toBe(250);
  });

  it('handles partial alerts', () => {
    const result = validateConfig({ alerts: { bell: false } });
    expect(result.alerts.bell).toBe(false);
    expect(result.alerts.notify).toBe(true);
  });
});
