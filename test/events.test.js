import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

const {
  addClient,
  closeAllClients,
} = await import('../server/events.js');

test('addClient registers a close handler on res', () => {
  const res = new EventEmitter();
  res.end = () => {};
  res.write = () => {};

  addClient(res);
  assert.equal(res.listenerCount('close'), 1);

  res.emit('close');
  assert.equal(res.listenerCount('close'), 1);
});

test('closeAllClients ends all clients and clears the set', () => {
  const res1 = new EventEmitter();
  const res2 = new EventEmitter();
  let endCount = 0;
  res1.end = () => { endCount++; };
  res1.write = () => {};
  res2.end = () => { endCount++; };
  res2.write = () => {};

  addClient(res1);
  addClient(res2);

  assert.equal(res1.listenerCount('close'), 1);
  assert.equal(res2.listenerCount('close'), 1);

  closeAllClients();

  assert.equal(endCount, 2);
});

test('closeAllClients handles client.end() throwing', () => {
  const res = new EventEmitter();
  res.end = () => { throw new Error('connection closed'); };
  res.write = () => {};

  addClient(res);
  closeAllClients();
});
