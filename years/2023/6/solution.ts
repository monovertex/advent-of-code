import { getQuadraticCriticalPoints } from '../../common';
import '../../prototype-extensions';

function getLineNumbers(line: string): number[] {
    return line.split(':')[1].splitByWhitespace().toNumbers();
}

function parseInput(input: string): [number[], number[]] {
    return input.splitByNewLine().map(getLineNumbers) as [number[], number[]];
}

function fragmentsToNumber(fragments: number[]): number {
    return Number(fragments.toStrings().join(''));
}

function solve(scenarios: [number, number][]): number {
    return scenarios.map(([time, distance]) => {
        const [lowerBound, upperBound] = getQuadraticCriticalPoints(-1, time, -distance)!;
        // The results are decimal, but we need to consider integers, as we can't hold the button
        // for a fraction of a second. Also account for the strict inequality condition for integers.
        const minimumTime = Number.isInteger(lowerBound) ? lowerBound + 1 : Math.ceil(lowerBound);
        const maximumTime = Number.isInteger(upperBound) ? upperBound - 1 : Math.floor(upperBound);
        return maximumTime - minimumTime + 1;
    }).multiply();
}

export function solvePart1(input: string): any {
    const [times, distances] = parseInput(input);
    return solve(times.zip(distances));
}

export function solvePart2(input: string): any {
    const [timeFragments, distanceFragments] = parseInput(input);
    const time = fragmentsToNumber(timeFragments);
    const distance = fragmentsToNumber(distanceFragments);
    return solve([[time, distance]]);
}
