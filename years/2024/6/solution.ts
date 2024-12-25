import { Matrix, ORTHOGONAL_DIRECTIONS, Point2D, rotateDirectionClockwise, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const GUARD_ORIENTATION_SYMBOL_TO_DIRECTION = new Map([
    ['^', ORTHOGONAL_DIRECTIONS.Y_POSITIVE],
    ['>', ORTHOGONAL_DIRECTIONS.X_POSITIVE],
    ['v', ORTHOGONAL_DIRECTIONS.Y_NEGATIVE],
    ['<', ORTHOGONAL_DIRECTIONS.X_NEGATIVE],
]);
const OBSTACLE_SYMBOL = '#';

function parseInput(input: string): [Matrix<string>, Point2D, ORTHOGONAL_DIRECTIONS] {
    const matrix = stringToStringMatrix(input);
    const startingPoint = matrix.findPoint((point: Point2D, value: string) => GUARD_ORIENTATION_SYMBOL_TO_DIRECTION.has(value))!;
    const startingDirection = GUARD_ORIENTATION_SYMBOL_TO_DIRECTION.get(matrix.getValue(startingPoint))!;
    return [matrix, startingPoint, startingDirection];
}

function pointAndDirectionToString(point: Point2D, direction: ORTHOGONAL_DIRECTIONS) {
    return `${point.toString()}-${direction}`;
}

function detectLoop(
    matrix: Matrix<string>,
    startingPoint: Point2D,
    startingDirection: ORTHOGONAL_DIRECTIONS,
    previousVisitedPointsAndDirections: Set<string>,
): boolean {
    let currentPoint = startingPoint;
    let currentDirection = startingDirection;
    const visitedPointsAndDirections = new Set<string>(previousVisitedPointsAndDirections);

    while (true) {
        const nextPoint = currentPoint.getOrthogonalNeighbor(currentDirection);
        if (!matrix.isPointInBounds(nextPoint)) break;
        if (matrix.getValue(nextPoint) === OBSTACLE_SYMBOL) {
            currentDirection = rotateDirectionClockwise(currentDirection);
            continue;
        }

        const nextPointAndDirectionAsString = pointAndDirectionToString(nextPoint, currentDirection);
        if (visitedPointsAndDirections.has(nextPointAndDirectionAsString)) return true;
        visitedPointsAndDirections.add(nextPointAndDirectionAsString);
        currentPoint = nextPoint;
    }

    return false;
}

function simulateWalk(matrix: Matrix<string>, startingPoint: Point2D, startingDirection: ORTHOGONAL_DIRECTIONS, testLoops: boolean = false): [number, number] {
    let currentPoint = startingPoint;
    let currentDirection = startingDirection;
    const visitedPointsAndDirections = new Set<string>([pointAndDirectionToString(currentPoint, currentDirection)]);
    const visitedPoints = new Set<string>([currentPoint.getUniqueKey()]);
    const loopingPoints = new Set<string>();

    while (true) {
        const nextPoint = currentPoint.getOrthogonalNeighbor(currentDirection);

        if (!matrix.isPointInBounds(nextPoint)) break;
        if (matrix.getValue(nextPoint) === OBSTACLE_SYMBOL) {
            currentDirection = rotateDirectionClockwise(currentDirection);
            continue;
        }

        const nextPointKey = nextPoint.getUniqueKey();
        // Not necessary to test for already visited points; they're either:
        // a) already determined as a looping point
        // b) not possible to mutate due to already being visited
        if (testLoops && !visitedPoints.has(nextPointKey)) {
            const nextPointValue = matrix.getValue(nextPoint);
            matrix.setValue(nextPoint, OBSTACLE_SYMBOL);
            if (detectLoop(matrix, currentPoint, currentDirection, visitedPointsAndDirections)) loopingPoints.add(nextPointKey);
            matrix.setValue(nextPoint, nextPointValue);
        }

        visitedPointsAndDirections.add(pointAndDirectionToString(nextPoint, currentDirection));
        visitedPoints.add(nextPointKey);
        currentPoint = nextPoint;
    }

    return [visitedPoints.size, loopingPoints.size];
}

export function solvePart1(input: string): number {
    const [matrix, startingPoint, startingDirection] = parseInput(input);
    const [visitedCount] = simulateWalk(matrix, startingPoint, startingDirection);
    return visitedCount;
}

export function solvePart2(input: string): number {
    const [matrix, startingPoint, startingDirection] = parseInput(input);
    const [, loopingCount] = simulateWalk(matrix, startingPoint, startingDirection, true);
    return loopingCount;
}
