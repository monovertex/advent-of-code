import { ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, shoelaceArea } from '@common';
import '@prototype-extensions';

const DIRECTION_INPUT_TO_VECTOR_MAP = new Map([
    ['R', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_POSITIVE)!],
    ['0', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_POSITIVE)!],

    ['L', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)!],
    ['2', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)!],

    ['U', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_POSITIVE)!],
    ['3', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_POSITIVE)!],

    ['D', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_NEGATIVE)!],
    ['1', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_NEGATIVE)!],
]);

function solve(input: [string, number][]) {
    let boundaryPointsCount = 0;
    const polygon: Point2D[] = input
        .reduce((points: Point2D[], [direction, distance]) => {
            const vector = DIRECTION_INPUT_TO_VECTOR_MAP.get(direction)!.multiply(distance);
            boundaryPointsCount += distance;
            return [...points, points.last()!.add(vector)];
        }, [new Point2D(0, 0)])
        .uniqueBy((point: Point2D) => point.toString());
    return shoelaceArea(polygon.reverse()) + boundaryPointsCount / 2 + 1;
}

export function solvePart1(input: string): any {
    const parsedInput = input
        .splitByNewLine()
        .map(line => line.splitByWhitespace())
        .map(([direction, distance]: string[]) => [direction, Number(distance)] as [string, number]);
    return solve(parsedInput);
}

export function solvePart2(input: string): any {
    const parsedInput = input
        .splitByNewLine()
        .map(line => line.splitByWhitespace())
        .map(([,, code]: string[]) => {
            const [direction, ...distanceFragments] = code.substring(2, 8).toArray().reverse();
            const distance = parseInt(distanceFragments.reverse().join(''), 16);
            return [direction, distance] as [string, number];
        });
    return solve(parsedInput);
}
