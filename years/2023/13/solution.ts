import { Matrix, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

function getVerticalReflectionOffset(pattern: string[][], tolerableErrorCount: number): number | null {
    for (let index = 0; index < pattern.length - 1; index++) {
        let checkIndex = index;
        let mirrorIndex = index + 1;
        let errorMargin = tolerableErrorCount;
        while (true) {
            if (checkIndex < 0 || mirrorIndex >= pattern.length) {
                // Only accept solutions where the error margin has been exhausted.
                if (errorMargin > 0) break;
                return index + 1;
            }

            const column = pattern[checkIndex];
            const mirrorColumn = pattern[mirrorIndex];
            const differences = column.zip(mirrorColumn).countBy(([a, b]) => a !== b);
            if (differences > errorMargin) break;
            errorMargin -= differences;
            checkIndex--;
            mirrorIndex++;
        }
    }
    return null;
}

function getHorizontalReflectionOffset(pattern: string[][], tolerableErrorCount: number): number | null {
    const patternAsRows = pattern.first().zip(...pattern.rest()).reverse();
    return getVerticalReflectionOffset(patternAsRows, tolerableErrorCount);
}

function solve(input: string, tolerableErrorCount: number): number {
    const patterns = input.splitByDoubleNewLine().map(stringToStringMatrix);
    return patterns
        .map((pattern) => {
            const verticalOffset = getVerticalReflectionOffset(pattern.data, tolerableErrorCount);
            const horizontalOffset = getHorizontalReflectionOffset(pattern.data, tolerableErrorCount);
            if (verticalOffset === null) return 100 * horizontalOffset!;
            if (horizontalOffset === null) return verticalOffset;
            return verticalOffset < horizontalOffset ? verticalOffset : 100 * horizontalOffset;
        })
        .sum();
}

export function solvePart1(input: string): any {
    return solve(input, 0);
}

export function solvePart2(input: string): any {
    return solve(input, 1);
}
