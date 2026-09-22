import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as K from './kernel.mjs';

test('zeckendorfDecompose(1) is the base case: just F=1', () => {
  const r = K.zeckendorfDecompose(1);
  assert.equal(r.ok, true);
  assert.deepEqual(r.indices, [0]);
  assert.deepEqual(r.fibs, [1]);
  assert.equal(r.sum, 1);
});

test('zeckendorfDecompose(10) matches the known decomposition 8+2', () => {
  const r = K.zeckendorfDecompose(10);
  assert.equal(r.ok, true);
  assert.deepEqual(r.indices, [1, 4]);
  assert.deepEqual(r.fibs, [2, 8]);
  assert.equal(r.sum, 10);
});

test('zeckendorfDecompose(12) matches the known decomposition 8+3+1', () => {
  const r = K.zeckendorfDecompose(12);
  assert.equal(r.ok, true);
  assert.deepEqual(r.indices, [0, 2, 4]);
  assert.deepEqual(r.fibs, [1, 3, 8]);
  assert.equal(r.sum, 12);
});

test('zeckendorfDecompose rejects zero, negatives, and non-integers without throwing', () => {
  assert.equal(K.zeckendorfDecompose(0).ok, false);
  assert.equal(K.zeckendorfDecompose(-5).ok, false);
  assert.equal(K.zeckendorfDecompose(3.5).ok, false);
  assert.equal(K.zeckendorfDecompose('10').ok, false);
});

test('isNonConsecutive rejects adjacent indices and accepts spaced ones', () => {
  assert.equal(K.isNonConsecutive([1, 2]).value, false);
  assert.equal(K.isNonConsecutive([0, 2, 4]).value, true);
});

test('isNonConsecutive boundary cases: empty and single-element arrays are vacuously non-consecutive', () => {
  assert.equal(K.isNonConsecutive([]).ok, true);
  assert.equal(K.isNonConsecutive([]).value, true);
  assert.equal(K.isNonConsecutive([7]).value, true);
});

test('isNonConsecutive treats a gap of exactly 2 as non-consecutive and a gap of 1 as consecutive', () => {
  assert.equal(K.isNonConsecutive([3, 5]).value, true);
  assert.equal(K.isNonConsecutive([3, 4]).value, false);
});

test('isNonConsecutive rejects non-integer numbers and non-number values without throwing', () => {
  assert.equal(K.isNonConsecutive([1, 3.5]).ok, false);
  assert.equal(K.isNonConsecutive(['1', 2]).ok, false);
  assert.equal(K.isNonConsecutive(null).ok, false);
});

test('combineInvariants is a strict AND across all four boolean combinations', () => {
  assert.equal(K.combineInvariants(true, true), true);
  assert.equal(K.combineInvariants(true, false), false);
  assert.equal(K.combineInvariants(false, true), false);
  assert.equal(K.combineInvariants(false, false), false);
});

test('verifyZeckendorf holds the invariant across a range of integers 1..200', () => {
  for (let n = 1; n <= 200; n++) {
    const r = K.verifyZeckendorf(n);
    assert.equal(r.ok, true, `n=${n} should be ok`);
    assert.equal(r.value, true, `n=${n} should satisfy the Zeckendorf invariant`);
    assert.equal(r.nonConsecutive, true, `n=${n} indices should be non-consecutive`);
    assert.equal(r.sumMatches, true, `n=${n} sum should match`);
  }
});
