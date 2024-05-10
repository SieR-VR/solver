export type Operation<T, R> = (...args: T[]) => R;
export type Data<T, Rank> = {
  level: Rank;
  value: T;
}

export type Recorded<T, O> = {
  value: T;
  operation?: O;
  previous?: Recorded<T, O>[];
}

export type Terminal<T> = Data<T, 0>;

export function solver<T>(input: Terminal<T>[], output: Terminal<T>, operations: Operation<T, T>[]): Recorded<T, Operation<T, T>>[] {
  const dataSet: Set<T> = new Set();
  const dataMap: Map<number, Set<Recorded<T, Operation<T, T>>>> = new Map();

  input.forEach((d) => {
    dataSet.add(d.value);

    if (dataMap.has(d.level)) {
      dataMap.get(d.level)!.add({ value: d.value });
    } else {
      dataMap.set(d.level, new Set([{ value: d.value }]));
    }
  });

  for (let level = 1; level < 16; level++) {
    const targetLevel = level - 1;

    for (let levelFirst = 0; levelFirst <= targetLevel; levelFirst++) {
      const levelSecond = targetLevel - levelFirst;

      const firstSet = dataMap.get(levelFirst)!;
      const secondSet = dataMap.get(levelSecond)!;

      firstSet.forEach((first) => {
        secondSet.forEach((second) => {
          operations.forEach((operation) => {
            const result = operation(first.value, second.value);

            if (!dataSet.has(result)) {
              dataSet.add(result);

              if (dataMap.has(level)) {
                dataMap.get(level)!.add({
                  value: result,
                  operation,
                  previous: [first, second]
                });
              }
              else {
                dataMap.set(level, new Set([{
                  value: result,
                  operation,
                  previous: [first, second]
                }]));
              }
            }
          });
        });
      });

      if (dataSet.has(output.value)) {
        const result = Array.from(dataMap.get(level)!).filter((d) => d.value === output.value)!;

        printMap(dataMap);
        return result;
      }
    }
  }

  return [];
}

function printMap<T>(map: Map<number, Set<Recorded<T, Operation<T, T>>>>) {
  map.forEach((set, level) => {
    console.log(`Level ${level}:`);
    set.forEach((recorded) => {
      console.log(`    ${recorded.value}`);
    });
  });
}
