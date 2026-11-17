import { describe, expect, it } from 'vitest';
import { checkAvailability } from '../src/availability';
import { BLOCKS, BOOKINGS } from '../src/data';

describe('checkAvailability', () => {
  it('accepts a free slot', () => {
    const r = checkAvailability({ date: '2026-11-20', startTime: '10:00', endTime: '11:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(true);
  });

  it('rejects end before start', () => {
    const r = checkAvailability({ date: '2026-11-20', startTime: '11:00', endTime: '10:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });

  it('rejects a booking that is too long', () => {
    const r = checkAvailability({ date: '2026-11-20', startTime: '08:00', endTime: '12:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });

  it('rejects overlap with an existing booking', () => {
    const r = checkAvailability({ date: '2026-11-18', startTime: '09:30', endTime: '10:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });

  it('rejects a blocked room', () => {
    const r = checkAvailability({ date: '2026-11-19', startTime: '12:30', endTime: '13:30' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });

  it('does not change stored bookings', () => {
    const before = JSON.stringify(BOOKINGS);
    checkAvailability({ date: '2026-11-18', startTime: '11:00', endTime: '12:00' }, BOOKINGS, BLOCKS);
    expect(JSON.stringify(BOOKINGS)).toBe(before);
  });
});
