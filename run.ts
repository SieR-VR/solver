import { solver, Operation } from "./src";
import { nand } from "./src/functions";

const operations: Operation<boolean, boolean>[] = [
  nand
];

const result = solver({
  suite: [
    [[false, false], true],
    [[false, true], false],
    [[true, false], false],
    [[true, true], true]
  ],
  arg_count: 2
}, operations, (ranks) => {
  return Math.max(...ranks) + 1;
});

console.dir(result);
