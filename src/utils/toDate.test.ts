import { toDate } from './toDate';

describe('toDate', () => {
  it('should pass through a date', () => {
    const date = new Date('2026-07-25T10:00:00.000Z');

    expect(toDate(date)).toEqual(date);
  });

  it('should convert a firestore timestamp', () => {
    const date = new Date('2026-07-25T10:00:00.000Z');

    expect(toDate({ toDate: () => date })).toEqual(date);
  });

  it('should convert numbers and strings', () => {
    const date = new Date('2026-07-25T10:00:00.000Z');

    expect(toDate(date.getTime())).toEqual(date);
    expect(toDate('2026-07-25T10:00:00.000Z')).toEqual(date);
  });

  it('should return undefined for empty or invalid values', () => {
    expect(toDate(undefined)).toBeUndefined();
    expect(toDate(null)).toBeUndefined();
    expect(toDate('not a date')).toBeUndefined();
    expect(toDate(new Date('nope'))).toBeUndefined();
  });
});
