import { solver, Data, Terminal, Operation } from "./src";
import { add, sub, mul, div } from "./src/functions";

const input: Terminal<number>[] = [
    { level: 0, value: 1 },
    { level: 0, value: 2 }, 
]

const output: Terminal<number> = { level: 0, value: 5 };

const operations: Operation<number, number>[] = [
    add,
    sub,
    mul,
    div
];

const result = solver(input, output, operations);
console.dir(result, { depth: null });