import '../../prototype-extensions';

const IDENTIFIER_HUMAN = 'humn';
const IDENTIFIER_ROOT = 'root';

class Operation {
    left: string;
    operator: string;
    right: string;

    constructor(input: string) {
        const [left, operator, right] = input.splitByWhitespace();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    compute(values: Map<string, bigint>): bigint {
        const leftValue = values.get(this.left)!;
        const rightValue = values.get(this.right)!;
        switch (this.operator) {
            case '+': return leftValue + rightValue;
            case '-': return leftValue - rightValue;
            case '*': return leftValue * rightValue;
            case '/': return leftValue / rightValue;
        };
        throw new Error(`Unknown operator: ${this.operator}`);
    }

    solveUnknownOperand(values: Map<string, bigint>, expectedValue: bigint): [bigint, bigint] {
        const leftValue = values.get(this.left);
        const rightValue = values.get(this.right);
        if (leftValue && rightValue) throw new Error('solveUnknownOperand: both values known');
        if (!leftValue && !rightValue) throw new Error('solveUnknownOperand: both values unknown');
        const knownValue = (leftValue || rightValue)!;

        if (!leftValue) {
            switch (this.operator) {
                case '+': return [expectedValue - knownValue, knownValue]; // l + r = e => l = e - r
                case '-': return [expectedValue + knownValue, knownValue]; // l - r = e => l = e + r
                case '*': return [expectedValue / knownValue, knownValue]; // l * r = e => l = e / r
                case '/': return [expectedValue * knownValue, knownValue]; // l / r = e => l = e * r
            };
        }

        if (!rightValue) {
            switch (this.operator) {
                case '+': return [knownValue, expectedValue - knownValue]; // l + r = e => r = e - l
                case '-': return [knownValue, knownValue - expectedValue]; // l - r = e => r = l - e
                case '*': return [knownValue, expectedValue / knownValue]; // l * r = e => r = e / l
                case '/': return [knownValue, knownValue / expectedValue]; // l / r = e => r = l / e
            };
        }

        throw new Error(`Unknown operator: ${this.operator}`);
    }
}

function parseInput(input: string): [Map<string, bigint>, Map<string, Operation>] {
    const values = new Map<string, bigint>();
    let operations = input.splitByNewLine().reduce((result, line) => {
        const [identifier, operation] = line.splitByColon();
        if (operation.match(/^\d+$/)) {
            values.set(identifier, BigInt(operation));
            return result;
        }

        result.set(identifier, new Operation(operation));
        return result;
    }, new Map<string, Operation>());
    return [values, operations];
}

function solveOperations(values: Map<string, bigint>, operations: Map<string, Operation>, targetIdentifier: string): bigint | null {
    while (!values.has(targetIdentifier)) {
        const currentOperationCount = operations.size;
        operations.entriesArray().forEach(([identifier, operation]) => {
            if (!values.has(operation.left) || !values.has(operation.right)) return;
            values.set(identifier, operation.compute(values));
            operations.delete(identifier);
        });
        if (currentOperationCount === operations.size) return null;
    }
    return values.get(targetIdentifier)!;
}

export function solvePart1(input: string): bigint {
    const [values, operations] = parseInput(input);
    return solveOperations(values, operations, IDENTIFIER_ROOT)!;
}

function solveBackwards(values: Map<string, bigint>, operations: Map<string, Operation>, operationIdentifier: string, expectedValue: bigint): bigint {
    if (operationIdentifier === IDENTIFIER_HUMAN) return expectedValue;
    const operation = operations.get(operationIdentifier)!;
    const initialLeftValue = solveOperations(values, operations, operation.left);
    const initialRightValue = solveOperations(values, operations, operation.right);
    if (initialLeftValue && initialRightValue) throw new Error('solveBackwards: both values known');
    const [leftValue, rightValue] = operation.solveUnknownOperand(values, expectedValue);
    values.set(operation.left, leftValue);
    values.set(operation.right, rightValue);

    if (!initialLeftValue) return solveBackwards(values, operations, operation.left, leftValue);
    return solveBackwards(values, operations, operation.right, rightValue);
}

export function solvePart2(input: string): bigint {
    const [values, operations] = parseInput(input);
    if (!values.has(IDENTIFIER_HUMAN)) throw new Error('Unexpected input (human is operation)');
    values.delete(IDENTIFIER_HUMAN)

    const rootOperation = operations.get(IDENTIFIER_ROOT)!;
    const rootLeftValue = solveOperations(values, operations, rootOperation.left);
    const rootRightValue = solveOperations(values, operations, rootOperation.right);
    return solveBackwards(values, operations, rootLeftValue ? rootOperation.right : rootOperation.left, (rootLeftValue || rootRightValue)!);
}
