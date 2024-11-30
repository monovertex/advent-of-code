import { DIAGONAL_DIRECTIONS, DIAGONAL_DIRECTION_VECTORS_2D_MAP, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, stringToPoint2DArray } from '../../common';
import '../../prototype-extensions';

const SAND_START = new Point2D<number>(500, 0);

// Using Y positive instead of negative to go down because the Y axis is flipped and the ceiling is at 0.
const SAND_DIRECTIONS = [
    ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_POSITIVE)!,
    DIAGONAL_DIRECTION_VECTORS_2D_MAP.get(DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE)!,
    DIAGONAL_DIRECTION_VECTORS_2D_MAP.get(DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE)!,
];
const FLOOR_DISTANCE = 2;

function parseRockPoints(input: string): Point2D[] {
    return input
        .splitByNewLine()
        .map((line) => stringToPoint2DArray(line, ' -> '))
        .flatMap((line) => {
            const result = [];
            let previous = line[0];
            for (let i = 1; i < line.length; i++) {
                result.push([previous, line[i]]);
                previous = line[i];
            }
            return result;
        })
        .flatMap(([startPoint, endPoint]) => {
            const stepVector = startPoint.getVectorTowards(endPoint);
            // Add the last point because it's not included in the loop.
            const result = [endPoint];
            for (let cursor = startPoint; !cursor.equals(endPoint); cursor = cursor.add(stepVector)) {
                result.push(cursor);
            }
            return result;
        });
}

function computeFloorY(rockPoints: Point2D[]): number {
    return Math.max(...rockPoints.map((point) => point.y)) + FLOOR_DISTANCE;
}

function simulateSandUntilConditionAndCount(floorY: number, rockPoints: Point2D[], conditionCallback: (point: Point2D) => boolean): number {
    const blockedPoints = new Set(rockPoints.map((point) => point.toString()));
    const uniqueRockPointsCount = blockedPoints.size;
    let movingSandPoint = SAND_START;

    while (true) {
        const newMovingSandPoint = SAND_DIRECTIONS
            .map((directionVector) => movingSandPoint.add(directionVector))
            .find((point) => !blockedPoints.has(point.toString()) && point.y < floorY);

        if (newMovingSandPoint) {
            movingSandPoint = newMovingSandPoint;
            continue;
        }

        blockedPoints.add(movingSandPoint.toString());
        if (conditionCallback(movingSandPoint)) break;
        movingSandPoint = SAND_START;
    }

    return blockedPoints.size - uniqueRockPointsCount;
}

export function solvePart1(input: string): any {
    const rockPoints = parseRockPoints(input);
    const floorY = computeFloorY(rockPoints);
    // Subtract one from the result because the sand point that touched the floor should not be counted.
    return simulateSandUntilConditionAndCount(floorY, rockPoints, (point) => point.y === floorY - 1) - 1;
}

export function solvePart2(input: string): any {
    const rockPoints = parseRockPoints(input);
    const floorY = computeFloorY(rockPoints);
    return simulateSandUntilConditionAndCount(floorY, rockPoints, (point) => point.equals(SAND_START));
}
