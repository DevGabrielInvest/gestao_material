import test from 'node:test';
import assert from 'node:assert/strict';

const {
  moneyLabel,
  dateOnly,
  dateLabel,
} = await import('../server/pdf.js');

test('moneyLabel formats as BRL currency', () => {
  assert.equal(moneyLabel(1000), 'R$ 1.000,00');
  assert.equal(moneyLabel(0), 'R$ 0,00');
  assert.equal(moneyLabel(1234.56), 'R$ 1.234,56');
  assert.equal(moneyLabel(0.5), 'R$ 0,50');
});

test('moneyLabel handles null / undefined', () => {
  assert.equal(moneyLabel(null), 'R$ 0,00');
  assert.equal(moneyLabel(undefined), 'R$ 0,00');
});

test('dateOnly extracts YYYY-MM-DD from Date', () => {
  const d = new Date('2026-07-23T15:00:00Z');
  assert.equal(dateOnly(d), '2026-07-23');
});

test('dateOnly extracts YYYY-MM-DD from string', () => {
  assert.equal(dateOnly('2026-07-23T15:30:00Z'), '2026-07-23');
  assert.equal(dateOnly('2026-07-23'), '2026-07-23');
});

test('dateOnly returns empty for null / undefined', () => {
  assert.equal(dateOnly(null), '');
  assert.equal(dateOnly(undefined), '');
});

test('dateLabel formats YYYY-MM-DD string as DD/MM/YYYY', () => {
  assert.equal(dateLabel('2026-07-23'), '23/07/2026');
  assert.equal(dateLabel('2024-02-29'), '29/02/2024');
});

test('dateLabel formats Date object', () => {
  const d = new Date('2026-01-05T12:00:00Z');
  assert.equal(dateLabel(d), '05/01/2026');
});

test('dateLabel returns em dash for null / undefined', () => {
  assert.equal(dateLabel(null), '—');
  assert.equal(dateLabel(undefined), '—');
});
