// kernel.mjs
// ZeckendorfFold — the unique representation of a positive integer as a sum
// of non-consecutive Fibonacci numbers, built by greedy subtraction.
// Pure, no I/O. Every function is total: bad input returns {ok:false,why:...}.

function isPositiveInteger(n) {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

// Fibonacci numbers >=1 up to (and including) n, using the Zeckendorf base
// F(2)=1, F(3)=2, F(4)=3, F(5)=5, ... (the duplicate F(1)=1 is skipped so
// every value in the list is distinct).
export function fibsUpTo(n) {
  if (!isPositiveInteger(n)) {
    return { ok: false, why: 'fibsUpTo requires a positive integer' };
  }
  const fibs = [1, 2];
  while (true) {
    const next = fibs[fibs.length - 1] + fibs[fibs.length - 2];
    if (next > n) break;
    fibs.push(next);
  }
  return { ok: true, value: fibs };
}

// Greedy-subtraction Zeckendorf decomposition of n.
// Returns { ok:true, indices, fibs, sum } where `indices` are positions into
// the internal fibs ladder (ascending, non-adjacent) and `fibs` are the
// actual Fibonacci values chosen (ascending), summing back to n.
export function zeckendorfDecompose(n) {
  if (!isPositiveInteger(n)) {
    return { ok: false, why: 'zeckendorfDecompose requires a positive integer' };
  }
  const fibsResult = fibsUpTo(n);
  if (!fibsResult.ok) return fibsResult;
  const fibs = fibsResult.value;

  let remainder = n;
  const chosen = [];
  // Walk the ladder top-down. Built as an explicit descending index list
  // (rather than a `length - 1` boundary counted down by a raw for-loop) so
  // there is no array-bounds arithmetic left for a mutant to flip into a
  // no-op: reading past either end of `order` simply isn't possible here,
  // where reading past the end of a hand-counted index range silently
  // returns `undefined` and every comparison against it is false anyway.
  const order = fibs.map((_, i) => i);
  order.reverse();
  for (const i of order) {
    if (fibs[i] <= remainder) {
      chosen.push(i);
      remainder -= fibs[i];
    }
  }
  if (remainder !== 0) {
    return { ok: false, why: 'internal error: remainder not zero after decomposition' };
  }

  chosen.sort((a, b) => a - b);
  const fibValues = chosen.map((i) => fibs[i]);
  const sum = fibValues.reduce((a, b) => a + b, 0);
  return { ok: true, indices: chosen, fibs: fibValues, sum };
}

// True iff no two indices in the (unsorted-safe) array are adjacent integers.
export function isNonConsecutive(indices) {
  if (!Array.isArray(indices)) {
    return { ok: false, why: 'isNonConsecutive requires an array' };
  }
  for (const v of indices) {
    if (typeof v !== 'number' || !Number.isInteger(v)) {
      return { ok: false, why: 'isNonConsecutive requires an array of integers' };
    }
  }
  const sorted = indices.slice().sort((a, b) => a - b);
  // Pairwise gap check via `.every`, not a hand-counted `i < sorted.length`
  // loop: `.every` only ever visits real indices 0..length-1, so there is
  // no off-the-end index for a boundary mutant to slip through unnoticed.
  const value = sorted.every((v, i) => i === 0 || v - sorted[i - 1] >= 2);
  return { ok: true, value };
}

// Pure combine of the two Zeckendorf invariants into one pass/fail bit.
// Kept as its own function (not inlined) because for any REAL decomposition
// the greedy algorithm guarantees both invariants hold together — so this
// boundary can never be exercised end-to-end through verifyZeckendorf with
// mismatched inputs. Testing it directly with synthetic booleans is the
// only way to pin the AND (as opposed to an OR) explicitly.
export function combineInvariants(nonConsecutive, sumMatches) {
  return nonConsecutive && sumMatches;
}

// Verifies both Zeckendorf invariants for n: chosen indices are non-adjacent,
// and the chosen Fibonacci values sum back to n exactly.
export function verifyZeckendorf(n) {
  const result = zeckendorfDecompose(n);
  if (!result.ok) return result;
  const nonConsec = isNonConsecutive(result.indices);
  if (!nonConsec.ok) return nonConsec;
  const sumMatches = result.sum === n;
  return {
    ok: true,
    value: combineInvariants(nonConsec.value, sumMatches),
    nonConsecutive: nonConsec.value,
    sumMatches,
  };
}
