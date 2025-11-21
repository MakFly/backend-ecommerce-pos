import { describe, it, expect } from 'vitest';
import { Money } from '@modules/products/domain/Money.js';

describe('Money', () => {
  it('should create a money object', () => {
    const money = Money.create(100, 'USD');

    expect(money.amount).toBe(100);
    expect(money.currency).toBe('USD');
  });

  it('should add two money values', () => {
    const money1 = Money.create(100, 'USD');
    const money2 = Money.create(50, 'USD');

    const result = money1.add(money2);

    expect(result.amount).toBe(150);
  });

  it('should throw error when adding different currencies', () => {
    const money1 = Money.create(100, 'USD');
    const money2 = Money.create(50, 'EUR');

    expect(() => money1.add(money2)).toThrow('Cannot add different currencies');
  });

  it('should format money correctly', () => {
    const money = Money.create(100.5, 'USD');

    expect(money.format()).toBe('100.50 USD');
  });
});
