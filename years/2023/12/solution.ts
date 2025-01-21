import { memoize } from '@common';
import '@prototype-extensions';

const SPRING_TYPE = {
    UNKNOWN: '?',
    WORKING: '.',
    DAMAGED: '#',
};

const backtrackSolution = memoize(
    function (
        springs: string[],
        damagedCounts: number[],
        previousSpring: string | null = null,
        activeDamagedCounts: number | null = null
    ): number {
        if (springs.length === 0) {
            if (damagedCounts.length === 0 && (activeDamagedCounts === null || activeDamagedCounts === 0)) return 1;
            return 0;
        }
        const [firstSpring, ...restSprings] = springs;

        if (firstSpring === SPRING_TYPE.WORKING) {
            if (activeDamagedCounts !== null && activeDamagedCounts !== 0) return 0;
            return backtrackSolution(restSprings, damagedCounts, firstSpring, null);
        }

        if (firstSpring === SPRING_TYPE.DAMAGED) {
            if (previousSpring === SPRING_TYPE.DAMAGED) {
                if (activeDamagedCounts === 0) return 0;
                return backtrackSolution(restSprings, damagedCounts, firstSpring, activeDamagedCounts! - 1);
            }

            if (previousSpring === SPRING_TYPE.WORKING || previousSpring === null) {
                return backtrackSolution(restSprings, damagedCounts.rest(), firstSpring, damagedCounts.first() - 1);
            }

            throw new Error('Unhandled damaged spring type');
        }

        if (firstSpring === SPRING_TYPE.UNKNOWN) {
            return backtrackSolution([SPRING_TYPE.WORKING, ...restSprings], damagedCounts, previousSpring, activeDamagedCounts) + backtrackSolution([SPRING_TYPE.DAMAGED, ...restSprings], damagedCounts, previousSpring, activeDamagedCounts);
        }

        throw new Error('Invalid spring type');
    },
    function (
        springs: string[],
        damagedCounts: number[],
        previousSpring: string | null = null,
        activeDamagedCounts: number | null = null
    ): string {
        return `${previousSpring}${springs.join('')}-${damagedCounts.join(',')}-${activeDamagedCounts}`;
    }
);

export function solve(input: [string, number[]][]) {
    return input.map(([springs, damagedCounts]) => backtrackSolution(springs.toArray(), damagedCounts)).sum();
}

export function solvePart1(input: string): number {
    return solve(input.splitByNewLine().map((line) => {
        const [springs, damagedCountsInput] = line.splitByWhitespace();
        return [springs, damagedCountsInput.splitByComma().toNumbers()] as [string, number[]];
    }));
}

function multiply(input: any, times: number): any[] {
    return Array.from({ length: times }, () => input);
}

export function solvePart2(input: string): number {
    return solve(input.splitByNewLine().map((line) => {
        const [springs, damagedCountsInput] = line.splitByWhitespace();
        return [
            multiply(springs, 5).join(SPRING_TYPE.UNKNOWN),
            multiply(damagedCountsInput.splitByComma().toNumbers(), 5).flat()
        ] as [string, number[]];
    }));
}
