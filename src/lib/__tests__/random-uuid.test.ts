import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';
import { randomUUID } from '../random-uuid';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function fixedBytes(bytes: number[]) {
  return {
    getRandomValues<T extends ArrayBufferView | null>(array: T): T {
      (array as unknown as Uint8Array).set(bytes);
      return array;
    },
  };
}

function withGlobalCrypto<T>(value: unknown, run: () => T): T {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value });
  try {
    return run();
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original);
    else Reflect.deleteProperty(globalThis, 'crypto');
  }
}

test('returns the native crypto.randomUUID value when the browser has it', () => {
  const id = randomUUID({
    randomUUID: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    getRandomValues: () => {
      throw new Error('getRandomValues must not be used when randomUUID exists');
    },
  });
  assert.equal(id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
});

test('calls the native randomUUID with its Crypto receiver intact', () => {
  assert.match(randomUUID(webcrypto as unknown as Crypto), UUID_V4_PATTERN);
});

test('builds a v4 UUID from getRandomValues when randomUUID is missing', () => {
  const sequential = Array.from({ length: 16 }, (_, index) => index);
  assert.equal(
    randomUUID(fixedBytes(sequential)),
    '00010203-0405-4607-8809-0a0b0c0d0e0f',
  );
});

test('forces the version and variant bits regardless of the random bytes', () => {
  assert.equal(
    randomUUID(fixedBytes(new Array(16).fill(0x00))),
    '00000000-0000-4000-8000-000000000000',
  );
  assert.equal(
    randomUUID(fixedBytes(new Array(16).fill(0xff))),
    'ffffffff-ffff-4fff-bfff-ffffffffffff',
  );
});

test('produces distinct well-formed v4 UUIDs from a real CSPRNG without randomUUID', () => {
  const source = {
    getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  } as Pick<Crypto, 'getRandomValues'>;
  const ids = new Set<string>();
  for (let index = 0; index < 2000; index += 1) {
    const id = randomUUID(source);
    assert.match(id, UUID_V4_PATTERN);
    ids.add(id);
  }
  assert.equal(ids.size, 2000);
});

test('uses the global crypto by default when randomUUID has been withheld', () => {
  const id = withGlobalCrypto(
    { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
    () => randomUUID(),
  );
  assert.match(id, UUID_V4_PATTERN);
});

test('refuses to invent an identifier without a secure random source', () => {
  const originalRandom = Math.random;
  let mathRandomCalls = 0;
  Math.random = () => {
    mathRandomCalls += 1;
    return originalRandom();
  };
  try {
    assert.throws(() => randomUUID({}), /secure random source/);
    assert.throws(
      () => withGlobalCrypto(undefined, () => randomUUID()),
      /secure random source/,
    );
    assert.equal(mathRandomCalls, 0);
  } finally {
    Math.random = originalRandom;
  }
});
