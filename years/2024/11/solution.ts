import { memoize } from '@common';
import '@prototype-extensions';

function splitNumber(input: bigint): [bigint, bigint] {
    const inputAsString = input.toString();
    const half = Math.floor(inputAsString.length / 2);
    return [BigInt(inputAsString.slice(0, half)), BigInt(inputAsString.slice(half))];
}

function applyRules(input: bigint): bigint[] {
    if (input === 0n) return [1n];
    if (input.digitCount().isEven()) return splitNumber(input);
    return [input * 2024n];
};

const simulateStoneChanges = memoize(
    (input: bigint, remainingIterations: number): bigint => {
        if (remainingIterations === 0) return 1n;
        return simulateStoneLineChanges(applyRules(input), remainingIterations - 1);
    },
    (input: bigint, remainingIterations: number) => `${input.toString()}-${remainingIterations}`
);

function simulateStoneLineChanges(input: bigint[], remainingIterations: number): bigint {
    return input.map((item: bigint) => simulateStoneChanges(item, remainingIterations)).sum();
}

function solve(input: string, iterations: number): bigint {
    return simulateStoneLineChanges(input.splitByWhitespace().toBigInts(), iterations);
}

export function solvePart1(input: string): bigint {
    return solve(input, 25);
}

export function solvePart2(input: string): bigint {
    return solve(input, 75);
}
