import { describe, it, expect } from 'vitest';
import { renderProgressBar } from './progressBar.js';

describe('renderProgressBar', () => {
  const originalColumns = process.stdout.columns;
  afterEach(() => {
    Object.defineProperty(process.stdout, 'columns', {
      value: originalColumns,
      configurable: true,
    });
  });

  it('renders 0% correctly', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 80, configurable: true });
    const line = renderProgressBar('Focus', 60000, 60000, 0);
    expect(line).toContain('Focus — 1:00 remaining');
    expect(line).toContain('0%');
    expect(line).toMatch(/\[░+\]/);;
  });

  it('renders 100% correctly', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 80, configurable: true });
    const line = renderProgressBar('Focus', 0, 60000, 100);
    expect(line).toContain('Focus — 0:00 remaining');
    expect(line).toContain('100%');
    expect(line).toMatch(/\[█+\]/);
  });

  it('renders partial progress', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 80, configurable: true });
    const line = renderProgressBar('Break', 30000, 60000, 50);
    expect(line).toContain('Break — 0:30 remaining');
    expect(line).toContain('50%');
  });

  it('uses bar width within clamp range', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 100, configurable: true });
    const line = renderProgressBar('Focus', 60000, 60000, 42);
    const match = line.match(/\[(█+)(░+)\]/);
    expect(match).toBeTruthy();
    const total = (match![1]?.length ?? 0) + (match![2]?.length ?? 0);
    expect(total).toBeLessThanOrEqual(40);
    expect(total).toBeGreaterThanOrEqual(10);
  });
});
