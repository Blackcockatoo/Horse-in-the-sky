import test from 'node:test';
import assert from 'node:assert/strict';

import { gustFactor, estimateCloudBase } from '../derive.ts';

test('gustFactor handles calm conditions safely', () => {
  assert.equal(gustFactor(0, 12), Infinity);
  assert.equal(gustFactor(0, 0), 1);
});

test('estimateCloudBase floors impossible negative spread to 0', () => {
  assert.equal(estimateCloudBase(8, 10), 0);
  assert.equal(estimateCloudBase(20, 15), 2000);
});
