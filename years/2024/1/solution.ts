import '@prototype-extensions';

function parseInput(input: string): [number[], number[]] {
    return input
        .splitByNewLine()
        .map((line) => line.splitByWhitespace())
        .unzip() as [number[], number[]];
}

export function solvePart1(input: string): number {
    const columns = parseInput(input).map((group) => group.sortAscendingNumbers());

    return columns.first().zip(columns.last())
        .map(([a, b]) => Math.abs(a - b))
        .sum();
}

export function solvePart2(input: string): number {
    const [numbers, appearences] = parseInput(input);
    const appearenceCounts = numbers.map((number) =>
        appearences.countBy((appearence) => appearence === number));
    return numbers.zip(appearenceCounts)
        .map(([number, count]) => number * count)
        .sum();
}
