import { Matrix, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, ORTHOGONAL_DIRECTIONS, Point2D, rotateDirectionClockwise, rotateDirectionCounterClockwise, stringToStringMatrix } from '@common';
import '@prototype-extensions';

enum MAP_SYMBOLS { WALKABLE = '.', WALL = '#', EMPTY = ' ' }
const isSpaceWalkable = (space: string) => space === MAP_SYMBOLS.WALKABLE;
const isSpaceNotEmpty = (space: string) => space !== MAP_SYMBOLS.EMPTY;

const DIRECTION_VALUES = new Map([
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, 0],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, 1],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, 2],
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, 3],
]);

function parseInput(input: string): [Matrix<string>, (number | string)[]] {
    const [mapInput, movesInput] = input.splitByDoubleNewLine();
    const matrix = stringToStringMatrix(mapInput);
    const moves = movesInput.match(/([LR])|(\d+)/g)!.map((move) => isNaN(Number(move)) ? move : Number(move));
    return [matrix, moves];
}

function computePassword(matrix: Matrix<string>, point: Point2D, direction: ORTHOGONAL_DIRECTIONS) {
    const rowValue = 1000 * (matrix.height - point.y);
    const columnValue = 4 * (point.x + 1);
    const directionValue = DIRECTION_VALUES.get(direction)!;
    // console.log(point, direction, rowValue, columnValue, directionValue);
    return rowValue + columnValue + directionValue;
}

function walk(
    matrix: Matrix<string>,
    moves: (number | string)[],
    walkWithWrap: (matrix: Matrix<string>, point: Point2D, direction: ORTHOGONAL_DIRECTIONS) => [Point2D, ORTHOGONAL_DIRECTIONS?]
): number {
    const walkerY = matrix.height - 1;
    const walkerX = matrix.getRow(walkerY).findIndex(isSpaceWalkable);
    let walkerPoint = new Point2D(walkerX, walkerY);
    let walkerDirection = ORTHOGONAL_DIRECTIONS.X_POSITIVE;

    for (const move of moves) {
        const walkerSpace = matrix.getValue(walkerPoint);
        // console.log(walkerPoint, walkerDirection, move);
        if (!isSpaceWalkable(walkerSpace)) throw ('Walker is not on a walkable space');

        if (move === 'L') {
            walkerDirection = rotateDirectionCounterClockwise(walkerDirection);
            continue;
        }

        if (move === 'R') {
            walkerDirection = rotateDirectionClockwise(walkerDirection);
            continue;
        }

        for (let moveIndex = 0; moveIndex < (move as number); moveIndex++) {
            const [nextPoint, nextDirection]: [Point2D, ORTHOGONAL_DIRECTIONS?] = walkWithWrap(matrix, walkerPoint, walkerDirection);
            // console.log('next', nextPoint);
            if (matrix.getValue(nextPoint) === MAP_SYMBOLS.WALL) break;
            walkerPoint = nextPoint;
            if (nextDirection) walkerDirection = nextDirection;
        }
    }

    return computePassword(matrix, walkerPoint, walkerDirection);
}

function walkWithBasicWrapAround(matrix: Matrix<string>, point: Point2D, direction: ORTHOGONAL_DIRECTIONS): [Point2D, ORTHOGONAL_DIRECTIONS?] {
    const nextPoint = point.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(direction)!);

    if (matrix.isPointInBounds(nextPoint) && isSpaceNotEmpty(matrix.getValue(nextPoint))) return [nextPoint];

    switch (direction) {
        case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            return [new Point2D(matrix.getRow(point.y).findIndex(isSpaceNotEmpty), point.y)];
        case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
            return [new Point2D(matrix.getRow(point.y).findLastIndex(isSpaceNotEmpty), point.y)];
        case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            return [new Point2D(point.x, matrix.getColumn(point.x).findIndex(isSpaceNotEmpty))];
        case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
            return [new Point2D(point.x, matrix.getColumn(point.x).findLastIndex(isSpaceNotEmpty))];
    }
    throw new Error('Invalid direction');
}

export function solvePart1(input: string): number {
    const [matrix, moves] = parseInput(input);
    return walk(matrix, moves, walkWithBasicWrapAround);
}

function walkWithCubeWrapAround(matrix: Matrix<string>, point: Point2D, direction: ORTHOGONAL_DIRECTIONS): [Point2D, ORTHOGONAL_DIRECTIONS?] {
    const nextPoint = point.getOrthogonalNeighbor(direction);

    if (matrix.isPointInBounds(nextPoint) && isSpaceNotEmpty(matrix.getValue(nextPoint))) return [nextPoint];

    switch (direction) {
        case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            if (point.y.isWithinBounds(0, 49) && point.x === 49)
                return [new Point2D(99 - point.y, 50), ORTHOGONAL_DIRECTIONS.Y_POSITIVE];

            if (point.y.isWithinBounds(50, 99) && point.x === 99)
                return [new Point2D(149, 249 - point.y), ORTHOGONAL_DIRECTIONS.X_NEGATIVE];

            if (point.y.isWithinBounds(100, 149) && point.x === 99)
                return [new Point2D(249 - point.y, 150), ORTHOGONAL_DIRECTIONS.Y_POSITIVE];

            if (point.y.isWithinBounds(150, 199) && point.x === 149)
                return [new Point2D(99, 249 - point.y), ORTHOGONAL_DIRECTIONS.X_NEGATIVE];

        case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
            if (point.y.isWithinBounds(0, 49) && point.x === 0)
                return [new Point2D(99 - point.y, 199), ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];

            if (point.y.isWithinBounds(50, 99) && point.x === 0)
                return [new Point2D(50, 249 - point.y), ORTHOGONAL_DIRECTIONS.X_POSITIVE];

            if (point.y.isWithinBounds(100, 149) && point.x === 50)
                return [new Point2D(149 - point.y, 99), ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];

            if (point.y.isWithinBounds(150, 199) && point.x === 50)
                return [new Point2D(0, 249 - point.y), ORTHOGONAL_DIRECTIONS.X_POSITIVE];

        case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            if (point.x.isWithinBounds(0, 49) && point.y === 99)
                return [new Point2D(50, 149 - point.x), ORTHOGONAL_DIRECTIONS.X_POSITIVE];

            if (point.x.isWithinBounds(50, 99) && point.y === 199)
                return [new Point2D(0, 99 - point.x), ORTHOGONAL_DIRECTIONS.X_POSITIVE];

            if (point.x.isWithinBounds(100, 149) && point.y === 199)
                return [new Point2D(point.x - 100, 0), ORTHOGONAL_DIRECTIONS.Y_POSITIVE];

        case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
            if (point.x.isWithinBounds(0, 49) && point.y === 0)
                return [new Point2D(point.x + 100, 199), ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];

            if (point.x.isWithinBounds(50, 99) && point.y === 50)
                return [new Point2D(49, 99 - point.x), ORTHOGONAL_DIRECTIONS.X_NEGATIVE];

            if (point.x.isWithinBounds(100, 149) && point.y === 150)
                return [new Point2D(99, 249 - point.x), ORTHOGONAL_DIRECTIONS.X_NEGATIVE];
    }

    throw new Error('No wrapping result');
}

export function solvePart2(input: string): number {
    const [matrix, moves] = parseInput(input);
    return walk(matrix, moves, walkWithCubeWrapAround);
}
