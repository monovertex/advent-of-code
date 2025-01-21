import '@prototype-extensions';

const DIGIT_MAP: [string, number][] = [
    ['one', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
];

function findFirstDigit(input: string, convertWords: boolean): number {
    let processedInput = input;

    if (convertWords) {
        const firstWordAndDigit = DIGIT_MAP.map(([word, digit]) => {
            const match = input.match(word);
            return match ? [word, digit, match.index] : null;
        }).filter(Boolean).sort((a, b) => (a![2] as number) - (b![2] as number)).first();

        if (firstWordAndDigit) processedInput = processedInput.replace(firstWordAndDigit[0] as string, String(firstWordAndDigit[1] as number));
    }

    const firstDigit = processedInput.toNumbers().reject(isNaN).first();
    return firstDigit;
}

function findLastDigit(input: string, convertWords: boolean): number {
    let processedInput = input;

    if (convertWords) {
        const lastWordAndDigit = DIGIT_MAP.map(([word, digit]) => {
            const match = input.reverse().match(word.reverse());
            return match ? [word, digit, match.index] : null;
        }).filter(Boolean).sort((a, b) => (a![2] as number) - (b![2] as number)).first();
        if (lastWordAndDigit) processedInput = processedInput.reverse().replace(
            (lastWordAndDigit[0] as string).reverse(),
            String(lastWordAndDigit[1] as number)
        ).reverse();
    }

    const lastDigit = processedInput.toNumbers().reject(isNaN).last();
    return lastDigit;
}

function extractNumber(input: string, convertWords: boolean): number {
    return Number(`${findFirstDigit(input, convertWords)}${findLastDigit(input, convertWords)}`);
}

export function solvePart1(input: string): any {
    return input.splitByNewLine().map((line) => extractNumber(line, false)).sum();
}

export function solvePart2(input: string): any {
    return input.splitByNewLine().map((line) => extractNumber(line, true)).sum();
}
