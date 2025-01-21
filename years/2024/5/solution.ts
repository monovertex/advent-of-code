import '@prototype-extensions';

class Sequence {
    items: number[];

    get length(): number {
        return this.items.length;
    }

    get middleValue(): number {
        return this.items[Math.floor(this.items.length / 2)];
    }

    constructor(items: number[]) {
        this.items = items;
    }

    clone(): Sequence {
        return new Sequence([...this.items]);
    }

    static fromString(input: string): Sequence {
        return new Sequence(input.splitByComma().toNumbers());
    }
}

class RuleSet {
    #rules: Map<number, number[]>;

    constructor(input: string) {
        this.#rules = input
            .splitByNewLine()
            .map(rule => rule.splitByPipe().toNumbers())
            .reduce((result, [before, after]) => {
                if (!result.has(before)) result.set(before, []);
                result.get(before)!.push(after);
                return result;
            }, new Map<number, number[]>());
    }

    isSequenceInvalid(sequence: Sequence): boolean {
        return sequence.items.some((number, index) => {
            if (index === 0 || !this.#rules.has(number)) return false;
            const pagesAfterNumber = this.#rules.get(number)!;
            // The sequence is invalid if any of the previous numbers should have been after the current number.
            return sequence.items.slice(0, index).some((prevNumber) => pagesAfterNumber.includes(prevNumber));
        });
    }

    fixSequence(sequence: Sequence): Sequence {
        let updatedSequence = sequence.clone();
        while (true) {
            if (!this.isSequenceInvalid(updatedSequence)) break;
            updatedSequence = this.#fixFirstMistake(updatedSequence);
        }
        return updatedSequence;
    }

    #fixFirstMistake(sequence: Sequence): Sequence {
        for (let index = 1; index < sequence.length; index++) {
            const number = sequence.items[index];
            if (index === 0 || !this.#rules.has(number)) continue;

            const preSequence = sequence.items.slice(0, index);
            const incorrectPreSequence = preSequence.filter((prevNumber) =>
                this.#rules.get(number)!.includes(prevNumber));
            if (incorrectPreSequence.length === 0) continue;

            const postSequence = sequence.items.slice(index + 1);
            const correctPreSequence = preSequence.without(...incorrectPreSequence);

            return new Sequence([...correctPreSequence, number, ...incorrectPreSequence, ...postSequence]);
        }
        return sequence;
    }
}

function parseInput(input: string): [RuleSet, Sequence[], Sequence[]] {
    const [rulesInput, sequencesInput] = input.splitByDoubleNewLine();
    const ruleSet = new RuleSet(rulesInput);
    const sequences = sequencesInput.splitByNewLine().map(Sequence.fromString);

    const validSequences = sequences.reject((sequence: Sequence) => ruleSet.isSequenceInvalid(sequence));
    const invalidSequences = sequences.without(...validSequences);

    return [ruleSet, validSequences, invalidSequences];
}

function sumMiddleValues(sequences: Sequence[]): number {
    return sequences.map((sequence) => sequence.middleValue).sum();
}

export function solvePart1(input: string): number {
    const [_ruleSet, validSequences] = parseInput(input);
    return sumMiddleValues(validSequences);
}

export function solvePart2(input: string): number {
    const [ruleSet, _validSequences, invalidSequences] = parseInput(input);
    const correctedSequences = invalidSequences.map((sequence) => ruleSet.fixSequence(sequence));
    return sumMiddleValues(correctedSequences);
}
