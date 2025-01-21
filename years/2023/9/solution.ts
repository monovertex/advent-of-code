import '@prototype-extensions';

function generateSequenceNumber(sequence: number[], forward: boolean): number {
    if (sequence.min() === sequence.max()) return sequence.first();
    const reducedSequence = sequence.reduce((result, item, index) => {
        if (index === 0) return result;
        result.push(item - sequence[index - 1]);
        return result;
    }, [] as number[]);
    const generatedNumber = generateSequenceNumber(reducedSequence, forward);
    if (forward) return sequence.last() + generatedNumber;
    return sequence.first() - generatedNumber;
}

function solve(input: string, forward: boolean) {
    return input
        .splitByNewLine()
        .map((line) => line.splitByWhitespace().toNumbers())
        .map((sequence) => generateSequenceNumber(sequence, forward))
        .sum();
}

export function solvePart1(input: string): any {
    return solve(input, true);
}

export function solvePart2(input: string): any {
    return solve(input, false);
}
