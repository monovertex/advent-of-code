import { Matrix, memoize, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

enum MAP_SYMBOLS {
    EMPTY = ',',
    WALL = '#',
    START = 'S',
    END = 'E',
}

const DEBUG = false;

type ShortestDistanceGetter = (map: Matrix<string>, startPoint: Point2D, endPoint: Point2D) => number;

function getShortestDistance(map: Matrix<string>, startPoint: Point2D, endPoint: Point2D) {
    const isNeighborValid = (_point: Point2D, _value: string, _neighborPoint: Point2D, neighborValue: string) =>
        neighborValue !== MAP_SYMBOLS.WALL;
    return map.shortestDistance(startPoint, endPoint, isNeighborValid);
}

function getPotentialPathPoints(
    map: Matrix<string>,
    startPoint: Point2D,
    endPoint: Point2D,
    maxDistance: number
): [Point2D, number][] {
    const potentialPathPoints: [Point2D, number][] = [];
    map.breadthFirstSearch(
        startPoint,
        (point, value, distance) => {
            potentialPathPoints.push([point, distance]);
            return false;
        },
        (point: Point2D, value: string, neighborPoint: Point2D, neighborValue: string, distance: number) => {
            if (neighborValue === MAP_SYMBOLS.WALL) return false;
            // There's no point in evaluating neighbors if we're never going to reach the end in time.
            return distance + point.getManhattanDistanceTo(endPoint) < maxDistance;
        }
    );
    return potentialPathPoints;
}

function getPotentialCheatPoints(
    pathPoints: [Point2D, number][],
    map: Matrix<string>,
    endPoint: Point2D,
    maxCheatDistance: number,
    maxDistance: number
): [Point2D, number][] {
    const potentialCheatPoints: [Point2D, Point2D, number, number][] = pathPoints.flatMap(([pathPoint, pathDistance]) => {
        const cheatPoints: [Point2D, number][] = [];
        map.breadthFirstSearch(
            pathPoint,
            (point: Point2D, value: string, cheatDistance: number) => {
                // Cheats have to go through at least one wall.
                if (value !== MAP_SYMBOLS.WALL && cheatDistance > 1)
                    cheatPoints.push([point, cheatDistance])
                return false;
            },
            (point: Point2D, value: string, neighborPoint: Point2D, neighborValue: string, cheatDistance: number) => {
                // Skip neighbors if we reached the max cheat distance.
                if (cheatDistance >= maxCheatDistance) return false;
                // Skip neighbors if we can't reach the end in time.
                if (pathDistance + cheatDistance + point.getManhattanDistanceTo(endPoint) >= maxDistance) return false;
                return true;
            }
        );
        // if (DEBUG) console.log('Cheat points for', pathPoint, cheatPoints);
        return cheatPoints.map(([cheatPoint, cheatDistance]) => [pathPoint, cheatPoint, pathDistance, cheatDistance]) as [Point2D, Point2D, number, number][];
    });

    return potentialCheatPoints
        .uniqueBy(([point, cheatPoint, pathDistance, _cheatDistance]) =>
            `${point.getUniqueKey()}-${cheatPoint.getUniqueKey()}-${pathDistance}`)
        .map(([_point, cheatPoint, pathDistance, cheatDistance]) => {
            // console.log(_point, cheatPoint, cheatDistance);
            return [cheatPoint, pathDistance + cheatDistance];
        });
}

function countCheats(
    map: Matrix<string>,
    startPoint: Point2D,
    endPoint: Point2D,
    maxCheatDistance: number,
    maxDistance: number
) {
    const getShortestDistanceMemoized = memoize(
        getShortestDistance,
        (_map: Matrix<string>, startPoint: Point2D, _endPoint: Point2D) => startPoint.getUniqueKey(),
    ) as ShortestDistanceGetter;

    const potentialPathPoints = getPotentialPathPoints(map, startPoint, endPoint, maxDistance);
    if (DEBUG) console.log('Potential path points', potentialPathPoints);

    const potentialCheatPoints = getPotentialCheatPoints(potentialPathPoints, map, endPoint, maxCheatDistance, maxDistance);
    if (DEBUG) console.log('Potential cheat points', potentialCheatPoints);

    if (DEBUG) console.log(potentialCheatPoints
        .map(([cheatPoint, distance]) => {
            if (cheatPoint.equals(endPoint)) return distance;
            // Skip points that are too far away in the best scenario.
            if (distance + cheatPoint.getManhattanDistanceTo(endPoint) >= maxDistance) return null;
            const shortestTime = getShortestDistanceMemoized(map, cheatPoint, endPoint);
            if (shortestTime !== null && distance + shortestTime >= maxDistance) return null;
            return distance + shortestTime;
        })
        .filter(Boolean)
        .groupBy((distance) => distance)
        .entriesArray()
        .map(([distance, distances]) => [84 - distance, distances.length])
        .sort(([a], [b]) => a - b)
    );

    return potentialCheatPoints.filter(([cheatPoint, distance]) => {
        if (cheatPoint.equals(endPoint)) return true;
        // Skip points that are too far away in the best scenario.
        if (distance + cheatPoint.getManhattanDistanceTo(endPoint) >= maxDistance) return false;
        const shortestTime = getShortestDistanceMemoized(map, cheatPoint, endPoint);
        return shortestTime !== null && distance + shortestTime < maxDistance;
    }).length;
}

function solve(input: string, maxCheatDistance: number, exampleSavedThreshold: number = 0) {
    const map = stringToStringMatrix(input);
    const startPoint = map.findPointOfValue(MAP_SYMBOLS.START)!;
    const endPoint = map.findPointOfValue(MAP_SYMBOLS.END)!;
    const maxDistance = getShortestDistance(map, startPoint, endPoint)!;
    if (DEBUG) console.log('Max distance', maxDistance);

    // The example has max distance of 84, but for the real input we need to find solutions that can save
    // us at least 100 steps.
    const resolvedMaxDistance = maxDistance < 100
        // Example input case
        ? maxDistance - exampleSavedThreshold
        // Real input case.
        : maxDistance - 99;
    return countCheats(map, startPoint, endPoint, maxCheatDistance, resolvedMaxDistance);
}

export function solvePart1(input: string): number {
    return solve(input, 2);
}

export function solvePart2(input: string): number {
    return solve(input, 20, 49);
}
