import '@prototype-extensions';

const DIVIDERS = [[[2]], [[6]]];

function packetArraysComparator(a: any[], b: any[]): number {
    for (let i = 0; i < a.length; i++) {
        if (i >= b.length) return 1;
        const inOrder = packetComparator(a[i], b[i]);
        if (inOrder === 0) continue;
        return inOrder;
    }
    return a.length === b.length ? 0 : -1;
};

function packetComparator(a: any[] | number, b: any[] | number): number {
    const aIsArray = a instanceof Array;
    const bIsArray = b instanceof Array;
    if (aIsArray || bIsArray) return packetArraysComparator(aIsArray ? a : [a], bIsArray ? b : [b]);
    if (a === b) return 0;
    return a < b ? -1 : 1;
};

export function solvePart1(input: string): any {
    return input
        .splitByDoubleNewLine()
        .map((pair) => pair.splitByNewLine().map((line) => JSON.parse(line)))
        .map(([a, b]) => packetComparator(a, b) === -1)
        .map((isCorrect, index) => [index + 1, isCorrect])
        .filter(([, isCorrect]) => isCorrect)
        .map(([index]) => index)
        .sum();
}

export function solvePart2(input: string): any {
    const sortedPackets = input
        .splitByDoubleNewLine()
        .flatMap((pair) => pair.split(/\n/).map((line) => JSON.parse(line)))
        .concat(DIVIDERS)
        .sort(packetComparator);
    const dividerIndices = DIVIDERS.map((divider) => sortedPackets.indexOf(divider) + 1);
    return dividerIndices[0] * dividerIndices[1];
}
