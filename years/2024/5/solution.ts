import '../../prototype-extensions';

function isSequenceInvalid(sequence: number[], rules: Map<number, number[]>): boolean {
    return sequence.some((number, index) => {
        if (index === 0 || !rules.has(number)) return false;
        const pagesAfterNumber = rules.get(number)!;
        // The sequence is invalid if any of the previous numbers should have been after the current number.
        return sequence.slice(0, index).some((prevNumber) => pagesAfterNumber.includes(prevNumber));
    });
}

function parseInput(input: string): [Map<number, number[]>, number[][], number[][]] {
    const [rulesInput, sequencesInput] = input.splitByDoubleNewLine();
    const rules = rulesInput
        .splitByNewLine()
        .map(rule => rule.splitByPipe().toNumbers())
        .reduce((result, [before, after]) => {
            if (!result.has(before)) result.set(before, []);
            result.get(before)!.push(after);
            return result;
        }, new Map<number, number[]>());
    const sequences = sequencesInput.splitByNewLine().map((line) => line.splitByComma().toNumbers());

    const validSequences = sequences.reject((sequence: number[]) => isSequenceInvalid(sequence, rules));
    const invalidSequences = sequences.without(...validSequences);

    return [rules, validSequences, invalidSequences];
}

function sumMiddleValues(sequences: number[][]): number {
    return sequences.map((sequence) => sequence[Math.floor(sequence.length / 2)]).sum();
}

export function solvePart1(input: string): number {
    const [_rules, validSequences] = parseInput(input);
    return sumMiddleValues(validSequences);
}

function fixFirstMistake(sequence: number[], rules: Map<number, number[]>): number[] {
    for (let index = 1; index < sequence.length; index++) {
        const number = sequence[index];
        if (index === 0 || !rules.has(number)) continue;

        const preSequence = sequence.slice(0, index);
        const incorrectPreSequence = preSequence.filter((prevNumber) => rules.get(number)!.includes(prevNumber));
        if (incorrectPreSequence.length === 0) continue;

        const postSequence = sequence.slice(index + 1);
        const correctPreSequence = preSequence.without(...incorrectPreSequence);

        return [...correctPreSequence, number, ...incorrectPreSequence, ...postSequence];
    }
    return sequence;
}

function fixSequence(sequence: number[], rules: Map<number, number[]>): number[] {
    let updatedSequence = [...sequence];
    while (true) {
        if (!isSequenceInvalid(updatedSequence, rules)) break;
        updatedSequence = fixFirstMistake(updatedSequence, rules);
    }
    return updatedSequence;
}

export function solvePart2(input: string): number {
    const [rules, _validSequences, invalidSequences] = parseInput(input);
    const correctedSequences = invalidSequences.map((sequence) => fixSequence(sequence, rules));
    return sumMiddleValues(correctedSequences);
}
