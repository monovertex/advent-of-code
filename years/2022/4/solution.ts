import '@prototype-extensions';

function overlaps([[start1, end1], [start2, end2]]: [[number, number], [number, number]]): boolean {
    return start1 <= end2 && start2 <= end1;
};

function fullyContains([[start1, end1], [start2, end2]]: [[number, number], [number, number]]): boolean {
    return start1 <= start2 && end1 >= end2 || start2 <= start1 && end2 >= end1;
};

function countMatchingPairs(input: string, predicate: any): number {
    return input
        .splitByNewLine()
        .map((ranges) => ranges
            .split(',')
            .map((range) => range.split('-').toNumbers())
        )
        .filter(predicate)
        .length;
}

export function solvePart1(input: string): any {
    return countMatchingPairs(input, fullyContains);
}

export function solvePart2(input: string): any {
    return countMatchingPairs(input, overlaps);
}
