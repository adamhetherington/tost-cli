import { describe, it, expect } from 'vitest';
import { formatTime } from './time.js';

describe('formatTime', () => {
  it('formats zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds', () => {
    expect(formatTime(5000)).toBe('0:05');
    expect(formatTime(30000)).toBe('0:30');
    expect(formatTime(59000)).toBe('0:59');
  });

  it('formats MM:SS for under 60 minutes', () => {
    expect(formatTime(60000)).toBe('1:00');
    expect(formatTime(125000)).toBe('2:05');
    expect(formatTime(3540000)).toBe('59:00');
  });

  it('formats HH:MM:SS for 60+ minutes', () => {
    expect(formatTime(3600000)).toBe('1:00:00');
    expect(formatTime(3661000)).toBe('1:01:01');
    expect(formatTime(7325000)).toBe('2:02:05');
  });

  it('handles invalid input', () => {
    expect(formatTime(-100)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
  });
});
