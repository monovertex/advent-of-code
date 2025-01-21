import { Matrix, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, ORTHOGONAL_DIRECTIONS, Point2D, stringToStringMatrix } from '@common';
import '@prototype-extensions';

enum MAP_SYMBOLS {
    WALL = '#',
    EMPTY = '.',
    BLIZZARD_UP = '^',
    BLIZZARD_RIGHT = '>',
    BLIZZARD_DOWN = 'v',
    BLIZZARD_LEFT = '<',
};

const BLIZZARD_DIRECTIONS_MAP = Object.freeze(new Map([
    [MAP_SYMBOLS.BLIZZARD_UP, ORTHOGONAL_DIRECTIONS.Y_POSITIVE],
    [MAP_SYMBOLS.BLIZZARD_RIGHT, ORTHOGONAL_DIRECTIONS.X_POSITIVE],
    [MAP_SYMBOLS.BLIZZARD_DOWN, ORTHOGONAL_DIRECTIONS.Y_NEGATIVE],
    [MAP_SYMBOLS.BLIZZARD_LEFT, ORTHOGONAL_DIRECTIONS.X_NEGATIVE],
]));

type Blizzard = {
    point: Point2D;
    value: MAP_SYMBOLS;
    direction: ORTHOGONAL_DIRECTIONS;
}

class ValleyMap extends Matrix<string> {
    blizzards: Blizzard[] = [];

    constructor(matrix: Matrix<string>, blizzards: Blizzard[]) {
        super(matrix.data);
        this.blizzards = blizzards;
    }
}

function parseInput(input: string): [ValleyMap, Point2D, Point2D] {
    const matrix = stringToStringMatrix(input);
    const startPointX = matrix.getRow(matrix.height - 1).indexOf(MAP_SYMBOLS.EMPTY)!;
    const startPoint = new Point2D(startPointX, matrix.height - 1);
    const endPointX = matrix.getRow(0).indexOf(MAP_SYMBOLS.EMPTY)!;
    const endPoint = new Point2D(endPointX, 0);
    const blizzards: Blizzard[] = matrix
        .filterPoints((_point: Point2D, value: string) => BLIZZARD_DIRECTIONS_MAP.has(value as MAP_SYMBOLS))
        .map((point: Point2D) => {
            const value = matrix.getValue(point) as MAP_SYMBOLS;
            return { point, value, direction: BLIZZARD_DIRECTIONS_MAP.get(value)! };
        });
    return [new ValleyMap(matrix, blizzards), startPoint, endPoint];
}

function moveBlizzards(map: ValleyMap): ValleyMap {
    const newMatrix = map.clone();
    map.blizzards.forEach(({ point }) => newMatrix.setValue(point, MAP_SYMBOLS.EMPTY));
    const newBlizzards = map.blizzards.map(({ point, direction, value}) => {
        const newPoint = point.getOrthogonalNeighbor(direction);
        const wrappedNewPoint = new Point2D(
            wrapCoordWithOffset(newPoint.x, map.width - 2),
            wrapCoordWithOffset(newPoint.y, map.height - 2)
        );
        const newBlizzard = { point: wrappedNewPoint, value, direction };
        newMatrix.setValue(wrappedNewPoint, value);
        return newBlizzard;
    });
    return new ValleyMap(newMatrix, newBlizzards);
}

function wrapCoordWithOffset(coord: number, max: number) {
    return (coord - 1 + max) % max + 1;
}

function getShortestTime(map: ValleyMap, startPoint: Point2D, endPoint: Point2D): [number, ValleyMap] {
    const visited: Set<string> = new Set([serializeTimeAndPoint(0, startPoint)]);
    const queue: { point: Point2D, time: number }[] = [{ point: startPoint, time: 0 }];
    const mapStates = [map];

    while (queue.length > 0) {
        const { point, time } = queue.shift()!;
        if (point.equals(endPoint)) return [time, mapStates[time]];

        // Keep track of map states to avoid re-computing blizzard movements.
        const newTime = time + 1;
        const newMap = mapStates[newTime] ?? moveBlizzards(mapStates[time]);
        mapStates[newTime] = newMap;

        // Account for the traveler standing still for a turn.
        for (let newPoint of [...point.orthogonalNeighbors(), point]) {
            const visitedKey = serializeTimeAndPoint(newTime, newPoint);
            if (!newMap.isPointInBounds(newPoint) || visited.has(visitedKey)) continue;
            const neighborValue = newMap.getValue(newPoint);
            if (neighborValue !== MAP_SYMBOLS.EMPTY) continue;
            queue.push({ point: newPoint, time: newTime });
            visited.add(visitedKey);
        }
    }

    throw new Error('No path found');
}

function serializeTimeAndPoint(time: number, point: Point2D): string {
    return `${time}:${point.toString()}`;
}

export function solvePart1(input: string): number {
    const [map, startPoint, endPoint] = parseInput(input);
    const [time] = getShortestTime(map, startPoint, endPoint);
    return time;
}

export function solvePart2(input: string): number {
    const [map, startPoint, endPoint] = parseInput(input);
    const [time1, mapAfterFirstTrip] = getShortestTime(map, startPoint, endPoint);
    const [time2, mapAfterSecondTrip] = getShortestTime(mapAfterFirstTrip, endPoint, startPoint);
    const [time3] = getShortestTime(mapAfterSecondTrip, startPoint, endPoint);
    return time1 + time2 + time3;
}
