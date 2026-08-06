import { getCustomCards, isValidCustomCardValue } from './CardConfigs';

describe('custom deck', () => {
  describe('value validation', () => {
    it('should accept whole numbers from 0 to 999', () => {
      expect(isValidCustomCardValue('0')).toBe(true);
      expect(isValidCustomCardValue('42')).toBe(true);
      expect(isValidCustomCardValue('999')).toBe(true);
    });

    it('should reject everything that is not a whole number in range', () => {
      expect(isValidCustomCardValue('')).toBe(false);
      expect(isValidCustomCardValue('XS')).toBe(false);
      expect(isValidCustomCardValue('1.5')).toBe(false);
      expect(isValidCustomCardValue('-1')).toBe(false);
      expect(isValidCustomCardValue('1000')).toBe(false);
    });
  });

  describe('deck building', () => {
    it('should carry the entered number as the card value, sorted ascending', () => {
      const cards = getCustomCards(['40', '1', '100']);
      const estimates = cards.filter((card) => card.value >= 0);

      expect(estimates.map((card) => card.value)).toEqual([1, 40, 100]);
      expect(estimates.map((card) => card.displayValue)).toEqual(['1', '40', '100']);
    });

    it('should append the unsure and the break card like the built-in decks', () => {
      const cards = getCustomCards(['1', '2']);

      expect(cards[cards.length - 2]).toMatchObject({ value: -2, displayValue: '❓' });
      expect(cards[cards.length - 1]).toMatchObject({ value: -1, displayValue: '-1' });
    });

    it('should collapse duplicates and drop invalid entries', () => {
      const cards = getCustomCards(['5', '5', 'XS', '', '3']);
      const estimates = cards.filter((card) => card.value >= 0);

      expect(estimates.map((card) => card.value)).toEqual([3, 5]);
    });
  });
});
