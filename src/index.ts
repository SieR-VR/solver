import { product, range_list } from "./utils";

export type Operation<T, R> = (...args: T[]) => R;

export type Suite<T> = [T[], T];

export type Dataset<T> = {
  arg_count: number;
  suite: Suite<T>[]
};

interface SolverContext<T> {
  suite_cache: Map<Suite<T>, Map<string, T>>;
  discovered: Map<number, Set<string>>;
  operations: Operation<T, T>[];
}

export function solver<T>(dataset: Dataset<T>, operations: Operation<T, T>[], rank_function: (ranks: number[]) => number): string {
  const placeholders = Array.from({ length: dataset.arg_count }, (_, i) => `d${i}`);
  const operation_placeholders = Array.from({ length: operations.length }, (_, i) => `o${i}`);

  const discovered: Map<number, Set<string>> = (() => {
    const discovered = new Map<number, Set<string>>();
    discovered.set(0, new Set(placeholders));

    return discovered;
  })()

  const suite_cache: Map<Suite<T>, Map<string, T>> = (() => {
    const cache = new Map<Suite<T>, Map<string, T>>();

    for (const suite of dataset.suite) {
      const suite_map = new Map<string, T>();
      cache.set(suite, suite_map);
    }

    return cache;
  })()


  for (let rank = 1; rank < 16; rank++) {
    discovered.set(rank, new Set())
    const it = product(range_list(rank), range_list(rank))

    for (const ranks of it) {
      if (rank_function(ranks) !== rank) continue
      const [left, right] = ranks

      const discovered_left = discovered.get(left)
      const discovered_right = discovered.get(right)

      if (!discovered_left || !discovered_right) continue

      for (const [left, right, operator] of product(discovered_left, discovered_right, operation_placeholders)) {
        const to_discover = `${left}${right}${operator}`
        discovered.get(rank)!.add(to_discover)
      }
    }

    const discovered_rank = discovered.get(rank)
    if (!discovered_rank) continue

    for (const to_discover of discovered_rank) {
      const every = dataset.suite.every(suite => {
        const result = evaluate(suite, to_discover, { suite_cache, discovered, operations })
        suite_cache.get(suite)!.set(to_discover, result.result)

        return result.matched
      })

      if (every) {
        return to_discover
      }
    }
  }

  return "Failed";
}

const token_regex = /^(?<cmd>[do])(?<index>\d+)/;

function evaluate<T>(suite: Suite<T>, to_discover: string, ctx: SolverContext<T>): { result: T, matched: boolean } {
  const [input, output] = suite
  const stack: T[] = []

  let pivot = 0

  while (true) {
    const match = token_regex.exec(to_discover.substring(pivot))
    if (!match || !match.groups) break

    pivot += match[0].length

    const cmd = match.groups.cmd
    const index = parseInt(match.groups.index)

    switch (cmd) {
      case 'd': {
        const terminal = input[index]
        stack.push(terminal)
        break
      }
      case 'o': {
        const operation = ctx.operations[index]

        if (stack.length < 2) {
          throw new Error('Not enough arguments for operation')
        }

        const args = stack.splice(-2, 2)
        const result = operation(...args)

        stack.push(result)
        break
      }
    }
  }

  return { result: stack[0], matched: stack[0] === output }
}
