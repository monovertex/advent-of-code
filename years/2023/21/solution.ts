import { IMatrix, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const TILE_TYPES = {
    GARDEN_PLOT: '.',
    ROCK: '#',
    START: 'S',
};

function wrapPointToBoundaries(matrix: IMatrix<String>, point: Point2D): Point2D {
    return new Point2D(
        ((point.x % matrix.width) + matrix.width) % matrix.width,
        ((point.y % matrix.height) + matrix.height) % matrix.height
    );
}

export function solvePart1(stepCount: number, input: string): number {
    const matrix = stringToStringMatrix(input);
    const startPoint = matrix.findPointOfValue(TILE_TYPES.START)!;
    const visitedPoints: Map<String, number> = new Map([[startPoint.getUniqueKey(), 0]]);
    const queue = [{ point: startPoint, distance: 0 }];

    while (queue.length > 0) {
        const { point, distance } = queue.shift()!;
        if (distance === stepCount) continue;

        const newDistance = distance + 1;

        for (let neighbor of point.orthogonalNeighbors()) {
            const wrappedNeighbor = wrapPointToBoundaries(matrix, neighbor);
            if (matrix.getValue(wrappedNeighbor) === TILE_TYPES.ROCK) continue;
            const neighborKey = neighbor.getUniqueKey();
            if (visitedPoints.has(neighborKey) && visitedPoints.get(neighborKey)! <= newDistance) continue;
            visitedPoints.set(neighborKey, newDistance);
            queue.push({ point: neighbor, distance: newDistance });
        }
    }

    const isEven = stepCount.isEven();
    return [...visitedPoints.entries()].countBy(([, distance]) => distance.isEven() === isEven);
}

export function solvePart2(stepCount: number, input: string): number {
    if (stepCount <= 500) return solvePart1(stepCount, input);

    const coeficient = input.splitByNewLine().length;
    const remainder = stepCount % coeficient;

    // Quadratic function: F(x) = a * x^2 + b * x + c = reachable plots at step 65 + 131 * x
    // x = 0 => F(0) = c = reachable plots at step 65 + 131 * 0
    const y0 = solvePart1(remainder, input);
    // x = 1 => F(1) = a + b + c = reachable plots at step 65 + 131 * 1
    const y1 = solvePart1(remainder + coeficient, input);
    // x = 2 => F(2) = 4a + 2b + c = reachable plots at step 65 + 131 * 2
    const y2 = solvePart1(remainder + coeficient * 2, input);

    // Quadratic coeficients
    const a = (y0 - 2 * y1 + y2) / 2;
    const b = (-3 * y0 + 4 * y1 - y2) / 2;
    const c = y0;
    const x = Math.floor(stepCount / coeficient);

    // Compute the quadratic result at X.
    return a * x * x + b * x + c;
}
