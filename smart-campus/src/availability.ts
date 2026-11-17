export interface Booking {
  id: string;
  start: string; // local ISO "YYYY-MM-DDTHH:mm"
  end: string;
  title: string;
}

export interface Block {
  start: string;
  end: string;
  reason: string;
}

export interface CheckRequest {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export type Reason = 'invalid' | 'past' | 'duration' | 'hours' | 'blocked' | 'conflict';

export type CheckResult =
  | { available: true; message: string }
  | { available: false; reason: Reason; message: string };

export const RULES = {
  minMinutes: 30,
  maxMinutes: 120,
  openHour: 8,
  closeHour: 20,
};

function toDate(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function checkAvailability(
  req: CheckRequest,
  bookings: readonly Booking[],
  blocks: readonly Block[],
): CheckResult {
  const start = toDate(req.date, req.startTime);
  const end = toDate(req.date, req.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { available: false, reason: 'invalid', message: 'Please enter a valid date and time.' };
  }
  if (end <= start) {
    return { available: false, reason: 'invalid', message: 'End time must be after start time.' };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (req.date < today) {
    return { available: false, reason: 'past', message: 'You cannot book a time in the past.' };
  }

  const minutes = (end.getTime() - start.getTime()) / 60000;
  if (minutes < RULES.minMinutes || minutes > RULES.maxMinutes) {
    return {
      available: false,
      reason: 'duration',
      message: `Booking must be between ${RULES.minMinutes} and ${RULES.maxMinutes} minutes.`,
    };
  }

  const openAt = toDate(req.date, `${String(RULES.openHour).padStart(2, '0')}:00`);
  const closeAt = toDate(req.date, `${String(RULES.closeHour).padStart(2, '0')}:00`);
  if (start < openAt || end > closeAt) {
    return {
      available: false,
      reason: 'hours',
      message: `The room is open ${RULES.openHour}:00–${RULES.closeHour}:00.`,
    };
  }

  for (const b of blocks) {
    const bStart = new Date(b.start);
    const bEnd = new Date(b.end);
    if (start < bEnd && end > bStart) {
      return { available: false, reason: 'blocked', message: `Room is blocked: ${b.reason}.` };
    }
  }

  for (const b of bookings) {
    const bStart = new Date(b.start);
    const bEnd = new Date(b.end);
    if (start < bEnd && end > bStart) {
      return {
        available: false,
        reason: 'conflict',
        message: `Overlaps with an existing booking (${b.start.slice(11)}–${b.end.slice(11)}).`,
      };
    }
  }

  return { available: true, message: 'The room is available for this time.' };
}
