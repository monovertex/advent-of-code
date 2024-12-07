import '../../prototype-extensions';

class Equation {
    result: bigint;
    operands: bigint[];

    constructor(input: string) {
        const [left, right] = input.splitByColon();
        this.result = BigInt(left);
        this.operands = right.splitByWhitespace().toBigInts();
    }
}

function evaluateEquationIterate(
    equation: Equation,
    useConcatenation: boolean,
    result: bigint,
    operands: bigint[],
): boolean {
    if (operands.isEmpty()) return result === equation.result;
    if (result !== null && result > equation.result) return false;

    const [operand, ...nextOperands] = operands;

    const sumResult = result + operand;
    if (evaluateEquationIterate(equation, useConcatenation, sumResult, nextOperands)) return true;

    const multiplyResult = result * operand;
    if (evaluateEquationIterate(equation, useConcatenation, multiplyResult, nextOperands)) return true;

    if (!useConcatenation) return false;
    const concatenateResult = BigInt(result.toString() + operand.toString());
    return evaluateEquationIterate(equation, useConcatenation, concatenateResult, nextOperands);
}

function evaluateEquation(equation: Equation, useConcatenation: boolean): boolean {
    return evaluateEquationIterate(
        equation,
        useConcatenation,
        equation.operands.first(),
        equation.operands.rest(),
    );
}

function solve(input: string, useConcatenation: boolean): bigint {
    const equations = input.splitByNewLine().map((line) => new Equation(line));
    return equations
        .filter((equation) => evaluateEquation(equation, useConcatenation))
        .map((equation) => equation.result)
        .sum();
}

export function solvePart1(input: string): bigint {
    return solve(input, false);
}

export function solvePart2(input: string): bigint {
    return solve(input, true);
}
