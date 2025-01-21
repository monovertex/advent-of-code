import { Matrix, Point2D, stringToStringMatrix } from '@common';
import '@prototype-extensions';

const SYMBOL_GROUND = '.';

/**
 * Knowing two points on a line, compute a new point at distance from point A, equal to the distance
 * between the two given points.
 * Known: xA, yA, xB, yB; Find: x, y
 * Slope formula:
 *   m = (yB - yA) / (xB - xA) =>
 *   (y - yA) = m * (x - xA)                OR (yA - y) = m * (xA - x)
 * Distance formula:
 *   d = sqrt((xB - xA)^2 + (yB - yA)^2)
 *   d = sqrt((x - xA)^2 + (y - yA)^2)      OR d = sqrt((xA - x)^2 + (yA - y)^2)
 *   d^2 = (x - xA)^2 + (y - yA)^2          OR d^2 = (xA - x)^2 + (yA - y)^2
 *   d^2 = (x - xA)^2 + (m * (x - xA))^2    OR d^2 = (xA - x)^2 + (m * (xA - x))^2
 *   d^2 = (x - xA)^2 + m^2 * (x - xA)^2    OR d^2 = (xA - x)^2 + m^2 * (xA - x)^2
 *   d^2 / (1 + m^2) = (x - xA)^2           OR d^2 / (1 + m^2) = (xA - x)^2
 *   d / sqrt(1 + m^2) = x - xA             OR d / sqrt(1 + m^2) = xA - x
 *   x = xA + d / sqrt((1 + m^2))           OR x = xA - d / sqrt((1 + m^2))
 *   y = yA + m * (x - xA)                  OR y = yA - m * (xA - x)
 */
function findAntinodePoint(pointA: Point2D, pointB: Point2D): [Point2D, Point2D] {
    const slope = pointA.getSlopeTo(pointB);
    const distance = pointA.getDistanceTo(pointB);
    const xOffset = distance / Math.sqrt(1 + slope ** 2);
    const x1 = Math.round(pointA.x + xOffset);
    const y1 = Math.round(pointA.y + slope * (x1 - pointA.x));
    const x2 = Math.round(pointA.x - xOffset)
    const y2 = Math.round(pointA.y - slope * (pointA.x - x2));
    return [new Point2D(x1, y1), new Point2D(x2, y2)];
}

function findSimpleAntinodePoints(_matrix: Matrix<string>, pointA: Point2D, pointB: Point2D): Point2D[] {
    const antinodes = [...findAntinodePoint(pointA, pointB), ...findAntinodePoint(pointB, pointA)];
    return antinodes.reject((point: Point2D) => point.equals(pointA) || point.equals(pointB));
}

function solve(
    input: string,
    findAntinodePoints: (matrix: Matrix<string>, pointA: Point2D, pointB: Point2D) => Point2D[]
): number {
    const matrix = stringToStringMatrix(input);
    const antennaGroups = matrix.reducePoints((result, point: Point2D, value: string) => {
        if (value === SYMBOL_GROUND) return result;
        if (!result.has(value)) result.set(value, []);
        result.get(value)!.push(point);
        return result;
    }, new Map<string, Point2D[]>());

    const antinodePoints = Array.from(antennaGroups.values()).flatMap((points) => {
        const antinodePoints = [];
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                antinodePoints.push(...findAntinodePoints(matrix, points[i], points[j]));
            }
        }
        return antinodePoints;
    });

    return antinodePoints
        .filter((point) => matrix.isPointInBounds(point))
        .uniqueBy((point) => point.toString())
        .length;
}

export function solvePart1(input: string): number {
    return solve(input, findSimpleAntinodePoints);
}

function findAllResonantAntinodePoints(matrix: Matrix<string>, pointA: Point2D, pointB: Point2D): Point2D[] {
    const antinodePoints = [];
    const slope = pointA.getSlopeTo(pointB);
    // Given slope, and iterating every X value, find integer Y values.
    // y - yA = m * (x - xA) => y = m * (x - xA) + yA
    for (let x = 0; x < matrix.width; x++) {
        const y = slope * (x - pointA.x) + pointA.y;
        if (!Number.isInteger(y)) continue;
        antinodePoints.push(new Point2D(x, y));
    }
    return antinodePoints;
}

export function solvePart2(input: string): number {
    return solve(input, findAllResonantAntinodePoints);
}
