// Task #03 verification probes. Each probe asserts the *correct* behaviour from
// the acceptance contract, so a FAILING probe = CONFIRMED defect.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAvailability } from '../../../src/availability';
import { BLOCKS, BOOKINGS } from '../../../src/data';

afterEach(() => vi.useRealTimers());

describe('F1 overlap (AC3)', () => {
  it('rejects a request that ENDS inside an existing booking (08:30–09:30 vs b1 09:00–10:30)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-17T09:00'));
    const r = checkAvailability({ date: '2026-11-18', startTime: '08:30', endTime: '09:30' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });
  it('rejects a request that ENCLOSES an existing booking (12:30–14:30 vs b2 13:00–14:00)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-17T09:00'));
    const r = checkAvailability({ date: '2026-11-18', startTime: '12:30', endTime: '14:30' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });
  it('still allows back-to-back booking (10:30–11:00 right after b1)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-17T09:00'));
    const r = checkAvailability({ date: '2026-11-18', startTime: '10:30', endTime: '11:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(true);
  });
});

describe('F2 past time today (AC1)', () => {
  it('rejects a slot earlier today (now 15:00, request 09:00–10:00 same day)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-21T15:00'));
    const r = checkAvailability({ date: '2026-11-21', startTime: '09:00', endTime: '10:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });
});

describe('F3 "today" computed in UTC (run with TZ=Asia/Almaty)', () => {
  it('rejects yesterday when local time is 02:00 (UTC still previous day)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T02:00')); // local time
    const r = checkAvailability({ date: '2026-11-21', startTime: '10:00', endTime: '11:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(false);
  });
});

describe('F4 time-dependent baseline test', () => {
  it('baseline "accepts a free slot" case still passes when the clock moves to 2026-12-01', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-12-01T09:00'));
    const r = checkAvailability({ date: '2026-11-20', startTime: '10:00', endTime: '11:00' }, BOOKINGS, BLOCKS);
    expect(r.available).toBe(true);
  });
});

describe('F12 claim: function mutates stored data (AC5)', () => {
  it('frozen inputs do not throw and are unchanged', () => {
    const frozen = Object.freeze(BOOKINGS.map((b) => Object.freeze({ ...b })));
    const before = JSON.stringify(frozen);
    expect(() =>
      checkAvailability({ date: '2026-11-18', startTime: '11:00', endTime: '12:00' }, frozen, Object.freeze([...BLOCKS])),
    ).not.toThrow();
    expect(JSON.stringify(frozen)).toBe(before);
  });
});

describe('Boundary rules (F9 missing coverage) – exploratory', () => {
  const at = () => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-11-17T09:00')); };
  it('exactly 30 min is allowed', () => { at(); expect(checkAvailability({ date: '2026-11-21', startTime: '10:00', endTime: '10:30' }, BOOKINGS, BLOCKS).available).toBe(true); });
  it('29 min is rejected', () => { at(); expect(checkAvailability({ date: '2026-11-21', startTime: '10:00', endTime: '10:29' }, BOOKINGS, BLOCKS).available).toBe(false); });
  it('exactly 120 min is allowed', () => { at(); expect(checkAvailability({ date: '2026-11-21', startTime: '10:00', endTime: '12:00' }, BOOKINGS, BLOCKS).available).toBe(true); });
  it('ending exactly at closing 20:00 is allowed', () => { at(); expect(checkAvailability({ date: '2026-11-21', startTime: '19:00', endTime: '20:00' }, BOOKINGS, BLOCKS).available).toBe(true); });
  it('starting before 08:00 is rejected', () => { at(); expect(checkAvailability({ date: '2026-11-21', startTime: '07:30', endTime: '08:30' }, BOOKINGS, BLOCKS).available).toBe(false); });
  it('empty input is rejected as invalid', () => { at(); expect(checkAvailability({ date: '', startTime: '', endTime: '' }, BOOKINGS, BLOCKS)).toMatchObject({ available: false, reason: 'invalid' }); });
});
