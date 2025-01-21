import '@prototype-extensions';

class Monkey {
    #items: number[] = [];
    #operation: (input: number) => number;
    #disivibleBy: number;
    #monkeyIfTrue: number;
    #monkeyIfFalse: number;
    #inspectionCount: number = 0;

    get inspectionCount() { return this.#inspectionCount; }
    get divisibleBy() { return this.#disivibleBy; }

    constructor(items: number[], operation: (input: number) => number, divisibleBy: number, monkeyIfTrue: number, monkeyIfFalse: number) {
        this.#items = items;
        this.#operation = operation;
        this.#disivibleBy = divisibleBy;
        this.#monkeyIfTrue = monkeyIfTrue;
        this.#monkeyIfFalse = monkeyIfFalse;
    }

    inspectItem(): [number, number] | undefined {
        if (this.#items.length === 0) return;
        const item = this.#items.shift();
        this.#inspectionCount++;
        const newItem = this.manageWorryLevel(this.#operation(item!));
        return [this.#test(newItem), newItem];
    }

    receiveItem(item: number) {
        this.#items.push(item);
    }

    manageWorryLevel(level: number) {
        return Math.floor(level / 3);
    }

    #test(item: number) {
        return item % this.#disivibleBy === 0 ? this.#monkeyIfTrue : this.#monkeyIfFalse;
    }
}

class MonkeyWithWorryLevelManagement extends Monkey {
    superModulo: number = 1;

    manageWorryLevel(level: number) {
        return level % this.superModulo;
    }
}

function parseOperation(input: string): (input: number) => number {
    const [, operation, value] = input.match(/new = old ([*+]) (\d+|old)/)!;
    return (operationInput: number): number => {
        const resolvedValue = value === 'old' ? operationInput : Number(value);
        return operation === '*' ? operationInput * resolvedValue : operationInput + resolvedValue;
    }
}

function parseTest(input: string, resultIfTrue: string, resultIfFalse: string): [number, number, number] {
    const [, value] = input.match(/divisible by (\d+)/)!;
    const [, monkeyIfTrue] = resultIfTrue.match(/monkey (\d+)/)!;
    const [, monkeyIfFalse] = resultIfFalse.match(/monkey (\d+)/)!;
    return [Number(value), Number(monkeyIfTrue), Number(monkeyIfFalse)];
}

function parseMonkeys<MonkeyT>(input: string, MonkeyClass: any): MonkeyT[] {
    return input.splitByDoubleNewLine().map((monkeyInput) => {
        const [, items, operation, test, resultIfTrue, resultIfFalse] = monkeyInput.splitByNewLine();
        return new MonkeyClass(
            items.match(/\d+/g)!.toNumbers(),
            parseOperation(operation),
            ...parseTest(test, resultIfTrue, resultIfFalse)
        );
    });
}

function getMonkeyBusinessLevels(monkeys: Monkey[], roundCount: number): number {
    for (let round: number = 0; round < roundCount; round++) {
        monkeys.forEach((monkey) => {
            let result;
            while (result = monkey.inspectItem()) monkeys[result[0]].receiveItem(result[1]);
        });
    }
    const inspectionCounts: number[] = monkeys.map((monkey) => monkey.inspectionCount).sort((a, b) => b - a);
    return inspectionCounts[0] * inspectionCounts[1];
}

export function solvePart1(input: string): any {
    const monkeys: Monkey[] = parseMonkeys(input, Monkey);
    return getMonkeyBusinessLevels(monkeys, 20);
}

export function solvePart2(input: string): any {
    const monkeys: MonkeyWithWorryLevelManagement[] = parseMonkeys(input, MonkeyWithWorryLevelManagement);
    const superModulo = monkeys.reduce((acc, monkey) => acc * monkey.divisibleBy, 1);
    monkeys.forEach((monkey) => monkey.superModulo = superModulo);
    return getMonkeyBusinessLevels(monkeys, 10_000);
}
