import { findIndexOfPoint, Matrix, memoize, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

enum MAP_SYMBOLS { EMPTY = ',', WALL = '#', START = 'S', END = 'E' };

function solve(input: string, maxCheatDistance: number, exampleSavedThreshold: number): number {
    const map = stringToStringMatrix(input);
    const path = getPath(map);
    // The example has max distance of 84, but for the real input we need to find solutions that can
    // save us at least 100 steps.
    return countCheats(map, path, maxCheatDistance, path.length < 100 ? exampleSavedThreshold : 100);
}

function getPath(map: Matrix<string>): Point2D[] {
    const startPoint = map.findPointOfValue(MAP_SYMBOLS.START)!;
    const endPoint = map.findPointOfValue(MAP_SYMBOLS.END)!;
    const path: Point2D[] = [startPoint];
    let currentPoint = startPoint;

    while (!currentPoint.equals(endPoint)) {
        const nextPoint = currentPoint.orthogonalNeighbors().find((neighborPoint) => {
            if (!map.isPointInBounds(neighborPoint)) return false;
            if (path.length > 1 && path[path.length - 2].equals(neighborPoint)) return false;
            return map.getValue(neighborPoint) !== MAP_SYMBOLS.WALL;
        });
        if (!nextPoint) throw new Error('No path found');
        path.push(nextPoint);
        currentPoint = nextPoint;
    }

    return path;
}

function countCheats(map: Matrix<string>, path: Point2D[], maxCheatDistance: number, minimumDistanceSaved: number) {
    const endPoint = path.last();
    const getPointIndex = memoize(
        (point: Point2D) => findIndexOfPoint(path, point),
        (point: Point2D) => point.getUniqueKey()
    );

    return path .flatMap((point, index) => {
        if (point.equals(endPoint)) return [];
        return generatePotentialCheatPoints(point, maxCheatDistance)
            .filter(([, cheatPoint]) => {
                if (!map.isPointInBounds(cheatPoint) ||
                    map.getValue(cheatPoint) === MAP_SYMBOLS.WALL) return false;
                const cheatPointIndex = getPointIndex(cheatPoint);
                const result = cheatPointIndex >= 0 &&
                    cheatPointIndex > index &&
                    cheatPointIndex - index - point.getManhattanDistanceTo(cheatPoint) >= minimumDistanceSaved;
                return result;
            });
    }).length;
}

function generatePotentialCheatPoints(point: Point2D, maxCheatDistance: number): [Point2D, Point2D][] {
    const cheatPoints: [Point2D, Point2D][] = [];
    for (let dX = -maxCheatDistance; dX <= maxCheatDistance; dX++) {
        const maxDY = maxCheatDistance - Math.abs(dX);
        for (let dY = -maxDY; dY <= maxDY; dY++) {
            if (dX === 0 && dY === 0) continue;
            cheatPoints.push([point, point.add(new Point2D(dX, dY))]);
        }
    }
    return cheatPoints;
}

export function solvePart1(input: string): number {
    return solve(input, 2, 1);
}

export function solvePart2(input: string): number {
    return solve(input, 20, 50);
}
