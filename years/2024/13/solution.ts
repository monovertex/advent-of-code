import { Point2D } from '@common';
import '@prototype-extensions';

type Equation = [Point2D<bigint>, Point2D<bigint>, Point2D<bigint>];

function parseInput(input: string, offset: bigint): Equation[] {
    return input.splitByDoubleNewLine().map((group) => group.splitByNewLine()).map(([buttonAInput, buttonBInput, destinationInput]) => {
        const [, xA, yA] = buttonAInput.match(/^Button A: X\+(\d+), Y\+(\d+)$/)!;
        const [, xB, yB] = buttonBInput.match(/^Button B: X\+(\d+), Y\+(\d+)$/)!;
        const [, xDest, yDest] = destinationInput.match(/^Prize: X=(\d+), Y=(\d+)$/)!;
        return [
            new Point2D(BigInt(xA), BigInt(yA)),
            new Point2D(BigInt(xB), BigInt(yB)),
            new Point2D(BigInt(xDest) + offset, BigInt(yDest) + offset)
        ];
    });
}

function solveEquation(equation: Equation): [number, number] | null {
    const [pointA, pointB, destination] = equation;
    // a*Xa + b*Xb = X => a = (X - b*Xb) / Xa
    // a*Ya + b*Yb = Y
    // => ((X - b*Xb) / Xa)*Ya + b*Yb = Y
    // => (X - b*Xb)*Ya + b*Yb*Xa = Y*Xa
    // => X*Ya - b*Xb*Ya + b*Yb*Xa = Y*Xa
    // => b*(Yb*Xa - Xb*Ya) = Y*Xa - X*Ya
    // => b = (Y*Xa - X*Ya) / (Yb*Xa - Xb*Ya)
    const b = Number(destination.y * pointA.x - destination.x * pointA.y) / Number(pointB.y * pointA.x - pointB.x * pointA.y);
    if (!Number.isInteger(b)) return null;
    const a = Number(destination.x - BigInt(b) * pointB.x) / Number(pointA.x);
    if (!Number.isInteger(a)) return null;
    return [a, b];
}

function solve(input: string, offset: bigint): bigint {
    return (parseInput(input, offset)
        .map((equation) => solveEquation(equation))
        .filter((solution) => solution !== null) as [number, number][])
        .map(([a, b]) => BigInt(a) * 3n + BigInt(b))
        .sum();
}

export function solvePart1(input: string): bigint {
    return solve(input, 0n);
}

export function solvePart2(input: string): bigint {
    return solve(input, 10000000000000n);
}
