import { solver, Data, Terminal, Operation } from "./src";
import { nand } from "./src/functions";

const input: Terminal<boolean>[] = [
  { level: 0, value: false },
  { level: 0, value: true },
]

const output: Terminal<boolean> = { level: 0, value: true };

const operations: Operation<boolean, boolean>[] = [
  nand
];

const result = solver(input, output, operations);
console.dir(result, { depth: null });
