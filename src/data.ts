// Fictional data only. No real people, no real rooms.
import type { Block, Booking } from './availability';

export const ROOM = {
  id: 'R-301',
  name: 'Room 301 (fictional)',
  building: 'Smart Campus, Block B',
  capacity: 24,
};

export const BOOKINGS: Booking[] = [
  { id: 'b1', start: '2026-11-18T09:00', end: '2026-11-18T10:30', title: 'Study group A' },
  { id: 'b2', start: '2026-11-18T13:00', end: '2026-11-18T14:00', title: 'Robotics club' },
  { id: 'b3', start: '2026-11-19T10:00', end: '2026-11-19T11:00', title: 'Lab consultation' },
  { id: 'b4', start: '2026-11-20T15:00', end: '2026-11-20T17:00', title: 'Hackathon prep' },
];

export const BLOCKS: Block[] = [
  { start: '2026-11-19T12:00', end: '2026-11-19T14:00', reason: 'Projector maintenance' },
];
