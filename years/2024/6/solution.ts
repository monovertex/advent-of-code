import { IMatrix, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, ORTHOGONAL_DIRECTIONS, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const GUARD_ORIENTATION_SYMBOL_TO_DIRECTION = new Map([
    ['^', ORTHOGONAL_DIRECTIONS.Y_POSITIVE],
    ['>', ORTHOGONAL_DIRECTIONS.X_POSITIVE],
    ['v', ORTHOGONAL_DIRECTIONS.Y_NEGATIVE],
    ['<', ORTHOGONAL_DIRECTIONS.X_NEGATIVE],
]);
const OBSTACLE_SYMBOL = '#';

function rotateDirectionRight(direction: ORTHOGONAL_DIRECTIONS) {
    switch (direction) {
        case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.Y_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.X_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.Y_POSITIVE;
        case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.X_POSITIVE;
    }
    throw new Error('Invalid direction');
}

function parseInput(input: string): [IMatrix<string>, Point2D, ORTHOGONAL_DIRECTIONS] {
    const matrix = stringToStringMatrix(input);
    const startingPoint = matrix.findPoint((point: Point2D, value: string) => GUARD_ORIENTATION_SYMBOL_TO_DIRECTION.has(value))!;
    const startingDirection = GUARD_ORIENTATION_SYMBOL_TO_DIRECTION.get(matrix.getValue(startingPoint))!;
    return [matrix, startingPoint, startingDirection];
}

function pointAndDirectionToString(point: Point2D, direction: ORTHOGONAL_DIRECTIONS) {
    return `${point.toString()}-${direction}`;
}

function simulateWalk(matrix: IMatrix<string>, startingPoint: Point2D, startingDirection: ORTHOGONAL_DIRECTIONS): [Point2D[], boolean] {
    let currentPoint = startingPoint;
    let currentDirection = startingDirection;
    let isLooping = false;
    const visitedPoints: Point2D[] = [currentPoint];
    const cachedVisitedPoints = new Set<string>([currentPoint.toString()]);
    const cachedPointsAndDirections = new Set<string>([pointAndDirectionToString(currentPoint, currentDirection)]);

    while (true) {
        const nextPoint = currentPoint.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(currentDirection)!);
        if (!matrix.isPointInBounds(nextPoint)) break;
        if (matrix.getValue(nextPoint) === OBSTACLE_SYMBOL) {
            currentDirection = rotateDirectionRight(currentDirection);
            continue;
        }

        const nextPointAndDirectionAsString = pointAndDirectionToString(nextPoint, currentDirection)
        if (cachedPointsAndDirections.has(nextPointAndDirectionAsString)) {
            isLooping = true;
            break;
        }
        cachedPointsAndDirections.add(nextPointAndDirectionAsString);

        const nextPointAsString = nextPoint.toString();
        if (!cachedVisitedPoints.has(nextPointAsString)) visitedPoints.push(nextPoint);
        cachedVisitedPoints.add(nextPointAsString);
        currentPoint = nextPoint;
    }

    return [visitedPoints, isLooping];
}

export function solvePart1(input: string): number {
    const [matrix, startingPoint, startingDirection] = parseInput(input);
    const [visitedPoints] = simulateWalk(matrix, startingPoint, startingDirection);
    return visitedPoints.length;
}

export function solvePart2(input: string): number {
    const [matrix, startingPoint, startingDirection] = parseInput(input);
    const [visitedPoints] = simulateWalk(matrix, startingPoint, startingDirection);

    return visitedPoints.countBy((visitedPoint) => {
        const currentValue = matrix.getValue(visitedPoint);
        matrix.setValue(visitedPoint, OBSTACLE_SYMBOL);
        const [, isLooping] = simulateWalk(matrix, startingPoint, startingDirection);
        matrix.setValue(visitedPoint, currentValue);
        return isLooping;
    });
}
