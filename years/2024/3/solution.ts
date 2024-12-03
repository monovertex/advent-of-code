import '../../prototype-extensions';

const OPERATION_REGEX = /mul\((\d+),(\d+)\)/g;
const OPERAND_REGEX = /(\d+)/g;
const DISABLED_SEQUENCE_REGEX = /don\'t\(\)(.*?)do\(\)/g;
const DISABLED_TRAILING_SEQUENCE_REGEX = /don\'t\(\)(.*?)$/g;

function evaluateOperations(input: string): number {
    return input
        .match(OPERATION_REGEX)!
        .map((operationInput) => operationInput.match(OPERAND_REGEX)!)
        .map(([a, b]) => parseInt(a) * parseInt(b))
        .sum();
}

export function solvePart1(input: string): number {
    return evaluateOperations(input);
}

export function solvePart2(input: string): number {
    const refinedInput = input
        .splitByNewLine().join('')
        .replaceAll(DISABLED_SEQUENCE_REGEX, '')
        .replace(DISABLED_TRAILING_SEQUENCE_REGEX, '');
    return evaluateOperations(refinedInput);
}
