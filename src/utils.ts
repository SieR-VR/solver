export function* product<T extends Array<Iterable<any>>>(...iterables: T): IterableIterator<{
  [K in keyof T]: T[K] extends Iterable<infer U> ? U : never
}> {
  if (iterables.length === 0) { return; }
  // make a list of iterators from the iterables
  const iterators = iterables.map(it => it[Symbol.iterator]());
  const results = iterators.map(it => it.next());
  if (results.some(r => r.done)) {
    throw new Error("Input contains an empty iterator.");
  }

  for (let i = 0; ;) {
    if (results[i].done) {
      // reset the current iterator
      iterators[i] = iterables[i][Symbol.iterator]();
      results[i] = iterators[i].next();
      // advance, and exit if we've reached the end
      if (++i >= iterators.length) { return; }
    } else {
      yield results.map(({ value }) => value) as any;
      i = 0;
    }
    results[i] = iterators[i].next();
  }
}

export function range_list(start: number, end?: number): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  return Array.from({ length: end - start }, (_, i) => i + start);
}
