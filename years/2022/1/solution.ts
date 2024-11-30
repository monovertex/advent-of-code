import '../../prototype-extensions';

function sumTopElves(input: string, elfCount: number): number {
    return input
        .splitByDoubleNewLine()
        .map((rawCaloriesForElf) => rawCaloriesForElf.splitByNewLine().toNumbers().sum())
        .sort((a: number, b: number) => b - a)
        .slice(0, elfCount)
        .sum();
}

export function solvePart1(input: string): any {
    return sumTopElves(input, 1);
}

export function solvePart2(input: string): any {
    return sumTopElves(input, 3);
}
