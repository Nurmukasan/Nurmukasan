import { describe, expect, it } from 'vitest';
import { checkAvailability, type CheckRequest } from '../src/availability';
import { BLOCKS, BOOKINGS } from '../src/data';

// Fixed clock: tests must not depend on the real date (risk R4).
const NOW = new Date('2026-11-17T09:00');
const check = (req: CheckRequest, now: Date = NOW) => checkAvailability(req, BOOKINGS, BLOCKS, now);

describe('checkAvailability', () => {
  it('accepts a free slot', () => {
    expect(check({ date: '2026-11-20', startTime: '10:00', endTime: '11:00' }).available).toBe(true);
  });

  it('rejects end before start', () => {
    expect(check({ date: '2026-11-20', startTime: '11:00', endTime: '10:00' }).available).toBe(false);
  });

  it('rejects a booking that is too long', () => {
    expect(check({ date: '2026-11-20', startTime: '08:00', endTime: '12:00' }).available).toBe(false);
  });

  it('rejects overlap with an existing booking', () => {
    expect(check({ date: '2026-11-18', startTime: '09:30', endTime: '10:00' }).available).toBe(false);
  });

  it('rejects a blocked room', () => {
    expect(check({ date: '2026-11-19', startTime: '12:30', endTime: '13:30' }).available).toBe(false);
  });

  it('does not change stored bookings', () => {
    const before = JSON.stringify(BOOKINGS);
    check({ date: '2026-11-18', startTime: '11:00', endTime: '12:00' });
    expect(JSON.stringify(BOOKINGS)).toBe(before);
  });
});

describe('regression: overlap (R1, AC3)', () => {
  it('rejects a request that ends inside an existing booking', () => {
    expect(check({ date: '2026-11-18', startTime: '08:30', endTime: '09:30' })).toMatchObject({ available: false, reason: 'conflict' });
  });

  it('rejects a request that encloses an existing booking', () => {
    expect(check({ date: '2026-11-18', startTime: '12:30', endTime: '14:30' })).toMatchObject({ available: false, reason: 'conflict' });
  });

  it('allows a back-to-back booking', () => {
    expect(check({ date: '2026-11-18', startTime: '10:30', endTime: '11:00' }).available).toBe(true);
  });
});

describe('regression: past times (R2, AC1)', () => {
  it('rejects a slot earlier today', () => {
    expect(check({ date: '2026-11-21', startTime: '09:00', endTime: '10:00' }, new Date('2026-11-21T15:00'))).toMatchObject({ available: false, reason: 'past' });
  });

  it('rejects a slot that already started', () => {
    expect(check({ date: '2026-11-21', startTime: '14:30', endTime: '15:30' }, new Date('2026-11-21T15:00'))).toMatchObject({ available: false, reason: 'past' });
  });

  it('rejects yesterday shortly after local midnight', () => {
    expect(check({ date: '2026-11-21', startTime: '10:00', endTime: '11:00' }, new Date('2026-11-22T02:00'))).toMatchObject({ available: false, reason: 'past' });
  });

  it('accepts later today', () => {
    expect(check({ date: '2026-11-21', startTime: '16:00', endTime: '17:00' }, new Date('2026-11-21T15:00')).available).toBe(true);
  });
});
