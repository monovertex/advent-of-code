import { Matrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, findIndexOfPoint, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const enum TILE_TYPE {
    GROUND = 'GROUND',
    START = 'START',
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL',
    NORTH_EAST = 'NORTH_EAST',
    NORTH_WEST = 'NORTH_WEST',
    SOUTH_WEST = 'SOUTH_WEST',
    SOUTH_EAST = 'SOUTH_EAST',
}

const TILE_MAP = new Map([
    ['S', TILE_TYPE.START],
    ['.', TILE_TYPE.GROUND],
    ['|', TILE_TYPE.VERTICAL],
    ['-', TILE_TYPE.HORIZONTAL],
    ['L', TILE_TYPE.NORTH_EAST],
    ['J', TILE_TYPE.NORTH_WEST],
    ['7', TILE_TYPE.SOUTH_WEST],
    ['F', TILE_TYPE.SOUTH_EAST],
]);

const DIRECTION_COMPATIBILITY_MAP = new Map([
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, [TILE_TYPE.VERTICAL, TILE_TYPE.SOUTH_EAST, TILE_TYPE.SOUTH_WEST]],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, [TILE_TYPE.VERTICAL, TILE_TYPE.NORTH_EAST, TILE_TYPE.NORTH_WEST]],
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, [TILE_TYPE.HORIZONTAL, TILE_TYPE.NORTH_WEST, TILE_TYPE.SOUTH_WEST]],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, [TILE_TYPE.HORIZONTAL, TILE_TYPE.NORTH_EAST, TILE_TYPE.SOUTH_EAST]],
]);

const TILE_DIRECTION_COMPATIBILITY_MAP = new Map([
    [TILE_TYPE.VERTICAL, [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, ORTHOGONAL_DIRECTIONS.Y_NEGATIVE]],
    [TILE_TYPE.HORIZONTAL, [ORTHOGONAL_DIRECTIONS.X_POSITIVE, ORTHOGONAL_DIRECTIONS.X_NEGATIVE]],
    [TILE_TYPE.NORTH_EAST, [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, ORTHOGONAL_DIRECTIONS.X_POSITIVE]],
    [TILE_TYPE.NORTH_WEST, [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, ORTHOGONAL_DIRECTIONS.X_NEGATIVE]],
    [TILE_TYPE.SOUTH_WEST, [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, ORTHOGONAL_DIRECTIONS.X_NEGATIVE]],
    [TILE_TYPE.SOUTH_EAST, [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, ORTHOGONAL_DIRECTIONS.X_POSITIVE]],
]);

const FLIP_TILE_TYPES = [TILE_TYPE.VERTICAL, TILE_TYPE.NORTH_EAST, TILE_TYPE.NORTH_WEST];

function parseInput(input: string): [Matrix<TILE_TYPE>, Point2D] {
    const matrix = stringToStringMatrix(input).mapPoints((point, value) => TILE_MAP.get(value)!);
    const startingPoint = matrix.findPointOfValue(TILE_TYPE.START)!;

    for (const [TILE_TYPE, directions] of [...TILE_DIRECTION_COMPATIBILITY_MAP.entries()]) {
        const matchesDirections = directions.every((direction) => {
            const neighborPoint = startingPoint.getOrthogonalNeighbor(direction);
            if (!matrix.isPointInBounds(neighborPoint)) return false;
            const neighborValue = matrix.getValue(neighborPoint);
            const possibleNeighborValues = DIRECTION_COMPATIBILITY_MAP.get(direction)!;
            return possibleNeighborValues.includes(neighborValue);
        });
        if (matchesDirections) {
            matrix.setValue(startingPoint, TILE_TYPE);
            break;
        }
    }

    return [matrix, startingPoint];
}

function breadthFirstSearch(
    matrix: Matrix<TILE_TYPE>,
    startingPoint: Point2D,
    matcher: (point: Point2D, value: TILE_TYPE, distance: number) => boolean
) {
    matrix.breadthFirstSearch(
        startingPoint,
        (point, value, distance) => matcher(point, value, distance),
        (point, value: TILE_TYPE, neighborPoint, neighborValue: TILE_TYPE) => {
            if (neighborValue === undefined) return false;

            const compatibleDirections = TILE_DIRECTION_COMPATIBILITY_MAP.get(value)!;
            const neighborVector = point.getVectorTowards(neighborPoint);
            const direction = compatibleDirections.find((direction) => ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(direction)!.equals(neighborVector));
            if (direction === undefined) return false;

            const compatibleNeighborValues = DIRECTION_COMPATIBILITY_MAP.get(direction)!;
            return compatibleNeighborValues.includes(neighborValue);
        }
    );
}

export function solvePart1(input: string): any {
    const [matrix, startingPoint] = parseInput(input);
    const distances: number[] = [];
    breadthFirstSearch(
        matrix,
        startingPoint,
        (point, value, distance) => {
            distances.push(distance);
            return false;
        }
    );
    return distances.max();
}

export function solvePart2(input: string): any {
    const [matrix, startingPoint] = parseInput(input);
    const loopPoints: Point2D[] = [];
    const flipLoopPoints: Point2D[] = [];
    breadthFirstSearch(
        matrix,
        startingPoint,
        (point, value, distance) => {
            loopPoints.push(point);
            if (FLIP_TILE_TYPES.includes(value)) flipLoopPoints.push(point);
            return false;
        }
    );

    let pointsInPolygonCount = 0;
    for (let y = 0; y < matrix.height; y++) {
        let isInsidePolygon = false;
        for (let x = 0; x < matrix.width; x++) {
            const point = new Point2D(x, y);

            if (findIndexOfPoint(loopPoints, point) === -1) {
                if (isInsidePolygon) pointsInPolygonCount++;
                continue;
            }

            if (findIndexOfPoint(flipLoopPoints, point) === -1) continue;

            isInsidePolygon = !isInsidePolygon;
        }
    }
    return pointsInPolygonCount;
}
